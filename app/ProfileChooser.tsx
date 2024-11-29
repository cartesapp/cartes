 import profiles from './bikeRouteProfiles.yaml'
 
 export default function ProfileChooser({
 	bikeRouteProfile,
 	setBikeRouteProfile,
 }) {
 	return (
 		<div>
 			Mode :
 			{profiles.map(({ key, name }) => (
 				<label
 					key={key}
 					css={css`
 						margin: 0 1rem;
 					`}
 				>
 					<input
 						type="radio"
 						name={key}
 						value={key}
 						checked={bikeRouteProfile === key}
 						onChange={(e) => setBikeRouteProfile(e.target.value)}
 					/>{' '}
 					{name}
 				</label>
 			))}
 		</div>
 	)
 }
