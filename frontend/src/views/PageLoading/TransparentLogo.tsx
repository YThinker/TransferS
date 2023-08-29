import { JSX } from "solid-js";
import './index.css';

export default (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
	<svg width="512px" height="512px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>
			<title>画板</title>
			<g id="画板" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
					<g id="编组-2" transform="translate(139.156156, 112.777778)">
							<g id="编组" transform="translate(38.054054, 143.567568) rotate(-90.000000) translate(-38.054054, -143.567568) translate(-105.513514, 105.513514)" fill="currentColor">
									<circle class="logo-eye1" id="椭圆形" cx="249.081081" cy="38.0540541" r="38.0540541"></circle>
									<circle class="logo-eye2" id="椭圆形" cx="38.0540541" cy="38.0540541" r="38.0540541"></circle>
							</g>
							<polyline class="logo-mouse" id="路径" stroke="currentColor" stroke-width="35" stroke-linecap="round" stroke-linejoin="round" transform="translate(204.109573, 143.567568) rotate(-90.000000) translate(-204.109573, -143.567568) " points="271.569032 114.833296 204.454918 172.301839 136.650113 114.833296"></polyline>
					</g>
			</g>
	</svg>
);