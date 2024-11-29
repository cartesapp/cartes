 import getQuestionsConfig from '@/app/(futureco)/simulateur/[...dottedName]/configBuilder'
 import { DottedName } from 'modele-social'
 import Engine from 'publicodes'
 import {
 	add,
 	countBy,
 	descend,
 	difference,
 	equals,
 	flatten,
 	head,
 	identity,
 	keys,
 	last,
 	length,
 	map,
 	mergeWith,
 	pair,
 	pipe,
 	reduce,
 	sortBy,
 	sortWith,
 	takeWhile,
 	toPairs,
 	zipWith,
 } from 'ramda'
 import { useMemo } from 'react'
 import { Simulation, SimulationConfig } from 'Reducers/rootReducer'
 import { getFoldedSteps, getSituation } from './simulationUtils'
 
 type MissingVariables = Partial<Record<DottedName, number>>
 export function getNextSteps(
 	missingVariables: Array<MissingVariables>
 ): Array<DottedName> {
 	const byCount = ([, [count]]: [unknown, [number]]) => count
 	const byScore = ([, [, score]]: [unknown, [unknown, number]]) => score
 
 	const missingByTotalScore = reduce<MissingVariables, MissingVariables>(
 		mergeWith(add),
 		{},
 		missingVariables
 	)
 
 	const innerKeys = flatten(map(keys, missingVariables)),
 		missingByTargetsAdvanced = Object.fromEntries(
 			Object.entries(countBy(identity, innerKeys)).map(
 				// Give higher score to top level questions
 				([name, score]) => [
 					name,
 					score + Math.max(0, 4 - name.split('.').length),
 				]
 			)
 		)
 
 	const missingByCompound = mergeWith(
 			pair,
 			missingByTargetsAdvanced,
 			missingByTotalScore
 		),
 		pairs = toPairs<number>(missingByCompound),
 		sortedPairs = sortWith([descend(byCount), descend(byScore) as any], pairs)
 	return map(head, sortedPairs) as any
 }
 
 // Max : 1
 // Min -> 0
 const questionDifference = (rule1 = '', rule2 = '') =>
 	1 /
 	(1 +
 		pipe(
 			zipWith(equals),
 			takeWhile(Boolean),
 			length
 		)(rule1.split(' . '), rule2.split(' . ')))
 
 export function getNextQuestions(
 	missingVariables: Array<MissingVariables>,
 	questionConfig: SimulationConfig['questions'] = {},
 	answeredQuestions: Array<DottedName> = [],
 	situation: Simulation['situation'] = {},
 	engine: Engine
 ): Array<DottedName> {
 	const {
 		'non prioritaires': notPriority = [],
 		prioritaires: priority = [],
 		liste: whitelist = [],
 		'liste noire': blacklist = [],
 	} = questionConfig
 
 	let nextSteps = difference(getNextSteps(missingVariables), answeredQuestions)
 	nextSteps = nextSteps.filter(
 		(step) =>
 			(!whitelist.length || whitelist.some((name) => step.startsWith(name))) &&
 			(!blacklist.length || !blacklist.some((name) => step.startsWith(name)))
 	)
 
 	const nextQuestions = nextSteps.filter((name) => {
 		const rule = engine.getRule(name)
 		return rule.rawNode.question != null
 	})
 
 	const lastStep = last(answeredQuestions)
 	// L'ajout de la réponse permet de traiter les questions dont la réponse est
 	// "une possibilité", exemple "contrat salarié . cdd"
 	const lastStepWithAnswer =
 		lastStep && situation[lastStep]
 			? ([lastStep, situation[lastStep]]
 					.join(' . ')
 					.replace(/'/g, '')
 					.trim() as DottedName)
 			: lastStep
 
 	return sortBy((question) => {
 		const indexList =
 			whitelist.findIndex((name) => question.startsWith(name)) + 1
 		const indexNotPriority =
 			(notPriority || []).findIndex((name) => question.startsWith(name)) + 1
 		const indexPriority =
 			(priority || []).findIndex((name) => question.startsWith(name)) + 1
 		const differenceCoeff = questionDifference(question, lastStepWithAnswer)
 		const score = indexList + indexNotPriority - indexPriority + differenceCoeff
 		return score
 	}, nextQuestions)
 }
 
 export const useNextQuestions = function (
 	objectives,
 	engine,
 	searchParams
 ): Array<DottedName> {
 	const rules = engine.getParsedRules()
 	const answeredQuestions = getFoldedSteps(searchParams, rules)
 	const questionsConfig = getQuestionsConfig(objectives[0])
 	const validatedSituation = getSituation(searchParams, rules)
 	const validatedEngine = engine.setSituation(validatedSituation)
 	const missingVariables = objectives.map(
 		(node) => validatedEngine.evaluate(node).missingVariables ?? {}
 	)
 	if (
 		objectives.length === 1 &&
 		objectives[0] === 'voyage . trajet voiture . coût trajet par personne'
 	) {
 		//This is a new rewrite of the getNextQuestions function, I wonder why we left this simplicity...
 		const allMissingEntries = Object.entries(missingVariables[0]),
 			missingEntries = allMissingEntries.filter(
 				([question]) => !answeredQuestions.includes(question)
 			),
 			orderedEntries = sortBy(([k, v]) => v, missingEntries).reverse(),
 			firstEntry = orderedEntries[0],
 			maxScore = firstEntry ? [1] : 0,
 			prio = questionsConfig.prioritaires || [],
 			artificialOrdered = sortBy(
 				([k, v]) =>
 					prio.includes(k)
 						? maxScore + [...prio].reverse().findIndex((kk) => kk === k) + 1
 						: v,
 				orderedEntries
 			).reverse()
 
 		const nextQuestions = artificialOrdered.map(([k, v]) => k)
 		/* not sure if not an old hook problem when foldedSteps in state
 		if (currentQuestion && currentQuestion !== nextQuestions[0]) {
 			return [currentQuestion, ...nextQuestions]
 		}
 		*/
 
 		return nextQuestions
 	}
 	const nextQuestions = useMemo(() => {
 		return getNextQuestions(
 			missingVariables,
 			questionsConfig,
 			answeredQuestions,
 			validatedSituation,
 			validatedEngine
 		)
 	}, [missingVariables, questionsConfig, answeredQuestions, validatedSituation])
 	/* see comment above
 	if (currentQuestion && currentQuestion !== nextQuestions[0]) {
 		return [currentQuestion, ...nextQuestions]
 	}
 	*/
 	return nextQuestions
 }
