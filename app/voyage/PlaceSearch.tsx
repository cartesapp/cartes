import GeoInputOptions from '@/components/conversation/GeoInputOptions'
import { InputStyle } from '@/components/conversation/UI'

export default function PlaceSearch({ onInputChange, state, setState }) {
	const { vers } = state
	return (
		<div>
			<InputStyle>
				<input
					type="text"
					autoFocus={true}
					value={vers.inputValue}
					placeholder={'Saint-Malo, Sarzeau, Le Conquet, ...'}
					onChange={onInputChange('vers')}
				/>
			</InputStyle>

			{vers.results && vers.inputValue !== '' && !state.vers.choice && (
				<GeoInputOptions
					{...{
						whichInput: 'vers',
						data: state['vers'],
						updateState: (newData) =>
							setState((state) => ({ ...state, vers: newData })),
					}}
				/>
			)}
		</div>
	)
}
