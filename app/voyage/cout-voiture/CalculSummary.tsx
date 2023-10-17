import css from '@/components/css/convertToJs'
import { CalculSummaryWrapper } from './CalculSummaryUI'
import rules from './data/rules'
import { formatValue, utils } from 'publicodes'
import { title } from '@/components/utils/publicodesUtils'

const rulesEntries = Object.entries(rules)
export default function CalculSummary({ engine, horizontal = false }) {
	return (
		<CalculSummaryWrapper $horizontal={horizontal}>
			{rules['trajet voiture . coût trajet'].formule.somme.map((el) => (
				<li key={el}>
					<details open={true}>
						<summary>{el}</summary>

						<Sum
							engine={engine}
							data={rulesEntries.find(
								([k, v]) => k.includes(el) && v.formule.somme
							)}
						/>
					</details>
				</li>
			))}
		</CalculSummaryWrapper>
	)
}

const Sum = ({ data: [parentDottedName, parentRule], engine }) => (
	<ul>
		{parentRule.formule.somme.map((le) => {
			const dottedName = utils.disambiguateReference(
					rules,
					parentDottedName,
					le
				),
				rule = rules[dottedName]

			const evaluation = engine && engine.evaluate(dottedName),
				value = evaluation && formatValue(evaluation)

			return (
				<li
					key={le}
					style={css`
						margin-left: 1rem;
					`}
				>
					{title({ ...rule, dottedName })}
					<small
						style={css`
							margin-left: 0.6rem;
						`}
					>
						{value}
					</small>
				</li>
			)
		})}
	</ul>
)