import { useNavigate } from '@remix-run/react'
import { Icon } from './icon'

export default function BtnBack() {
	const navigate = useNavigate()
	return (
		<button
			onClick={() => {
				navigate(-1)
			}}
		>
			<Icon name="arrow-left" />
		</button>
	)
}
