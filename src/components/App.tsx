import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import clientContext from "../context/clientContext";
import ChoosePatient from "./ChoosePatient";
import LaunchOpenDIPS from "./LaunchOpenDIPS";
import LaunchSyntHIR from "./LaunchSyntHIR";
import CdssWithOpenDIPS from "./CdssWithOpenDIPS";
import Cdss from "./Cdss";
import NotFound from "./NotFound";
import Client from "fhirclient/lib/Client";
import { useEffect, useState } from "react";
import FHIR from "fhirclient";
import Landing from "./Landing";

const App: React.FC = () => {
	const [client, setClient] = useState<Client>(undefined!);
	const [clientSyntHIR, setClientSyntHIR] = useState<Client>(undefined!);
	const [loading, setLoading] = useState<boolean>(false);
	let isSyntHIRClicked =
		sessionStorage.getItem("synthirClickKey") != null &&
		JSON.parse(sessionStorage.getItem("synthirClickKey") || "");

	useEffect(() => {
		setLoading(true);

		console.log(isSyntHIRClicked);
		if (!isSyntHIRClicked.synthirClick) {
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
						sessionStorage.setItem(
							"synthirAccessToken",
							JSON.stringify(clientSyntHIR.state.tokenResponse?.access_token)
						);
						// eslint-disable-next-line react-hooks/exhaustive-deps
						isSyntHIRClicked = { ...isSyntHIRClicked, synthirClick: false };
						sessionStorage.setItem(
							"synthirClickKey",
							JSON.stringify(isSyntHIRClicked)
						);
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
	}, [isSyntHIRClicked.synthirClick]);

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
						<Route path="/" element={<Landing />} />
						<Route path="/LaunchOpenDIPS" element={<LaunchOpenDIPS />} />
						<Route path="/LaunchSyntHIR" element={<LaunchSyntHIR />} />
						<Route
							path="/launch"
							element={<ChoosePatient clientLoading={loading} />}
						/>
						<Route path="/app" element={<LaunchOpenDIPS />} />
						<Route path="/patient/:id" element={<CdssWithOpenDIPS />} />
						<Route path="/synthirPatient/:id" element={<Cdss />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Router>
			</div>
		</clientContext.Provider>
	);
};

export default App;
