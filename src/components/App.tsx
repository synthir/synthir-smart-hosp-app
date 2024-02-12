import {
	BrowserRouter as Router,
	Route,
	Routes,
	useNavigate,
} from "react-router-dom";
import clientContext from "../context/clientContext";
import ChoosePatient from "./ChoosePatient";
import Launch from "./Launch";
import Launch1 from "./Launch1";
//import Patient from "./Patient";
import SyntHIRCdss from "./SyntHIRCdss";
import NotFound from "./NotFound";
import Client from "fhirclient/lib/Client";
import { useEffect, useState } from "react";
import FHIR from "fhirclient";

const App: React.FC = () => {
	const [client, setClient] = useState<Client>(undefined!);
	const [clientSyntHIR, setClientSyntHIR] = useState<Client>(undefined!);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setLoading(true);
		if (!localStorage.getItem("synthirClick")) {
			FHIR.oauth2
				.ready()
				.then((client) => {
					//dipsclient
					const updateClient = async () => {
						setClient(client);
					};
					updateClient().then(() => {
						setLoading(false);
					});
				})
				.catch((error) => {
					setLoading(false);
					console.log(error);
				});
		} else {
			console.log("synthir");
			FHIR.oauth2
				.ready()
				.then((clientSyntHIR) => {
					const updateClient = async () => {
						setClientSyntHIR(clientSyntHIR);
						console.log(clientSyntHIR);
						localStorage.setItem(
							"synthirAccessToken",
							JSON.stringify(clientSyntHIR.state.tokenResponse.access_token)
						);
						localStorage.removeItem("synthirClick");
					};
					updateClient().then(() => {
						setLoading(false);
					});
				})
				.catch((error) => {
					setLoading(false);
					console.log(error);
				});
		}
	}, []);

	return (
		<clientContext.Provider
			value={{
				client: client,
				setClient: setClient,
				clientSyntHIR: clientSyntHIR,
				setClientSyntHIR: setClientSyntHIR,
			}}
		>
			<div>
				<Router>
					<Routes>
						<Route path="/" element={<Launch />} />
						<Route
							path="/launch"
							element={<ChoosePatient clientLoading={loading} />}
						/>
						<Route path="/app" element={<Launch />} />
						<Route path="/patient/:id" element={<SyntHIRCdss />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Router>
			</div>
		</clientContext.Provider>
	);
};

export default App;
