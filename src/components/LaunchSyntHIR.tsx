import FHIR from "fhirclient";
import { useSearchParams } from "react-router-dom";

const LaunchSyntHIR: React.FC = () => {
	const [searchParams] = useSearchParams();

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
		client_id: "2a8f1f87-9cce-40d5-8015-1548529965ad",
		scope:
			"https://synthir-test-fhir-server.azurehealthcareapis.com/user_impersonation",
		launch: launch,
		pkceMode: "unsafeV1",
	});

	return null;
};

export default LaunchSyntHIR;
