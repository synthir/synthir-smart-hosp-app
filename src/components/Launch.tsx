import FHIR from "fhirclient";
import { useSearchParams } from "react-router-dom";

const Launch: React.FC = () => {
	const [searchParams] = useSearchParams();

	// Let user specify issuer (iss) in query param
	let iss = searchParams.get("iss");
	if (!iss) {
		iss = "https://api.dips.no/fhir";
	}

	let launch = searchParams.get("launch");
	if (!launch) {
		launch = "";
	}

	if (!localStorage.getItem("synthirClick")) {
		FHIR.oauth2.authorize({
			iss: "https://api.dips.no/fhir",
			redirectUri: "/launch",
			client_id: "pavitra-uit",
			clientSecret: "2HG_Lr!8eQxmDTF",
			scope: "openid dips-fhir-r4 fhirUser patient/*.read offline_access",
			launch: launch,
		});
	}
	return null;
};

export default Launch;
