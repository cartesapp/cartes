 import { sortBy } from 'ramda'
 import { utils as coreUtils, capitalise0 } from 'publicodes'
 
 export const MODEL_ROOT_RULE_NAME = 'bilan'
 
 export function isRootRule(dottedName: DottedName): boolean {
 	return dottedName === MODEL_ROOT_RULE_NAME
 }
 
 export const parentName = (dottedName, outputSeparator = ' . ', shift = 0) =>
 	splitName(dottedName).slice(shift, -1).join(outputSeparator)
 
 export const splitName = (dottedName) => dottedName.split(' . ')
 
 export const FullName = ({ dottedName }) => (
 	<span>
 		{splitName(dottedName).map((fragment, index) => (
 			<span>
 				{index > 0 && ' · '}
 				{capitalise0(fragment)}
 			</span>
 		))}
 	</span>
 )
 
 export const title = (rule) =>
 	rule.titre ||
 	capitalise0(splitName(rule.dottedName)[splitName(rule.dottedName).length - 1])
 // Publicodes's % unit is strangely handlded
 // the nodeValue is * 100 to account for the unit
 // hence we divide it by 100 and drop the unit
 export const correctValue = (evaluated) => {
 	const { nodeValue, unit } = evaluated
 
 	const result = unit?.numerators.includes('%') ? nodeValue / 100 : nodeValue
 	return result
 }
 
 export const ruleFormula = (rule) =>
 	rule?.explanation?.valeur?.explanation?.valeur
 
 function ruleSumNode(
 	rules: NGCRulesNodes,
 	rule: NGCRuleNode
 ): string[] | undefined {
 	const formula = rule.rawNode.formule
 
 	if (!formula || !formula['somme']) {
 		return undefined
 	}
 
 	return formula['somme']
 		?.map((name: string) => {
 			try {
 				const node = coreUtils.disambiguateReference(
 					rules,
 					rule.dottedName,
 					name
 				)
 				return node
 			} catch (e) {
 				console.log(
 					`One element of the sum is not a variable. It could be a raw number injected by the optimisation algorithm.`,
 					e
 				)
 				return null
 			}
 		})
 		.filter(Boolean)
 }
 
 export const extractCategoriesNamespaces = (
 	rules,
 	engine,
 	parentRule = 'bilan'
 ) => {
 	const rule = engine.getRule(parentRule),
 		sumNodes = ruleSumNode(rule)
 
 	const categories = sumNodes.map((dottedName) => {
 		const categoryName = splitName(dottedName)[0]
 		const node = engine.getRule(categoryName)
 
 		const { icônes, couleur } = rules[categoryName]
 		return {
 			...node,
 			icons: icônes,
 			color: couleur,
 		}
 	})
 
 	return categories
 }
 
 export function extractCategories(
 	rules: any,
 	engine: Engine<DottedName>,
 	valuesFromURL?: any,
 	parentRule = MODEL_ROOT_RULE_NAME,
 	sort = true
 ): Category[] {
 	const rule = engine.getRule(parentRule)
 	const sumNodes = ruleSumNode(
 		engine.getParsedRules() as NGCRulesNodes,
 		rule as NGCRuleNode
 	)
 
 	if (sumNodes === undefined) {
 		return []
 	}
 
 	const categories = sumNodes.map((dottedName) => {
 		const node = engine.evaluate(dottedName) as Category
 		const { icônes, couleur, abréviation } = rules[dottedName]
 		const split = splitName(dottedName),
 			parent = split.length > 1 ? split[0] : ''
 		return {
 			...node,
 			icons: icônes || rules[parent].icônes,
 			color: couleur || rules[parent].couleur,
 			nodeValue: valuesFromURL ? valuesFromURL[dottedName[0]] : node.nodeValue,
 			dottedName: (isRootRule(parentRule) && parent) || node.dottedName,
 			documentationDottedName: node.dottedName,
 			title:
 				isRootRule(parentRule) && parent ? rules[parent].titre : node.title,
 			abbreviation: abréviation,
 		}
 	})
 
 	return sort ? sortCategories(categories) : categories
 }
 
 export const sortCategories = sortBy(({ nodeValue }) => -nodeValue)
 
 export const safeGetRule = (engine, dottedName) => {
 	try {
 		const rule = engine.evaluate(engine.getRule(dottedName))
 		return rule
 	} catch (e) {
 		console.log(e)
 	}
 }
 export const buildEndURL = (rules, engine) => {
 	const categories = extractCategories(rules, engine),
 		detailsString =
 			categories &&
 			categories.reduce(
 				(memo, next) =>
 					memo +
 					next.name[0] +
 					(Math.round(next.nodeValue / 10) / 100).toFixed(2),
 				''
 			)
 
 	if (detailsString == null) return null
 
 	return `/fin?details=${detailsString}`
 }
