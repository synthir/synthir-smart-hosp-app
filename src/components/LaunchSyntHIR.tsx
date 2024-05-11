import FHIR from "fhirclient";
import { useSearchParams } from "react-router-dom";

const LaunchSyntHIR: React.FC = () => {
	const [searchParams] = useSearchParams();
	const synthirClientID = process.env.REACT_APP_SYNTHIR_CLIENT_ID || "";
	const synthirClientScope = process.env.REACT_APP_SYNTHIR_CLIENT_SCOPE || "";
	console.log(synthirClientID, synthirClientScope);
	const isSyntHIRClicked =
		sessionStorage.getItem("synthirClickKey") != null &&
		JSON.parse(sessionStorage.getItem("synthirClickKey") || "");

	// Let user specify issuer (iss) in query param
	let iss = searchParams.get("iss");
	if (!iss) {
		iss = "https://synthir-test-fhir-server.azurehealthcareapis.com";
	}

	let launch = searchParams.get("launch");
	if (!launch) {
		launch = "";
	}

	const redirectURI = isSyntHIRClicked?.synthirWorkflow ? "/launch" : "/app";

	FHIR.oauth2.authorize({
		iss: iss,
		redirectUri: redirectURI,
		client_id: synthirClientID,
		scope: synthirClientScope,
		launch: launch,
		pkceMode: "unsafeV1",
	});

	return null;
};

export default LaunchSyntHIR;
