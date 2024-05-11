import FHIR from "fhirclient";
import { useSearchParams } from "react-router-dom";

const LaunchOpenDIPS: React.FC = () => {
	const [searchParams] = useSearchParams();
	const dipsClientID = process.env.REACT_APP_DIPS_CLIENT_ID || "";

	const dipsClientSecret = process.env.REACT_APP_DIPS_CLIENT_SECRET || "";

	// Let user specify issuer (iss) in query param
	let iss = searchParams.get("iss");
	if (!iss) {
		iss = "https://api.dips.no/fhir";
	}

	let launch = searchParams.get("launch");
	if (!launch) {
		launch = "";
	}

	const isSyntHIRClicked =
		sessionStorage.getItem("synthirClickKey") != null &&
		JSON.parse(sessionStorage.getItem("synthirClickKey") || "");

	if (!isSyntHIRClicked.synthirClick) {
		FHIR.oauth2.authorize({
			iss: "https://api.dips.no/fhir",
			redirectUri: "/launch",
			client_id: dipsClientID,
			clientSecret: dipsClientSecret,
			scope: "openid dips-fhir-r4 fhirUser patient/*.read offline_access",
			launch: launch,
		});
	}
	return null;
};

export default LaunchOpenDIPS;
