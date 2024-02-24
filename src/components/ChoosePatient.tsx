import { KeyboardEvent, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clientContext from "../context/clientContext";
import { IsSyntHIRClickedType } from "./types";

const ChoosePatient: React.FC<{
	clientLoading: boolean;
	isSyntHIRClicked: IsSyntHIRClickedType;
}> = ({ clientLoading, isSyntHIRClicked }) => {
	const [patientId, setPatientId] = useState<string>("");
	const { client, clientSyntHIR } = useContext(clientContext);
	const isSynthirWorkflow = isSyntHIRClicked.synthirWorkflow;
	const currentWorkflowClient = isSynthirWorkflow ? clientSyntHIR : client;
	const navigate = useNavigate();

	const renderPatient = (id: string) => {
		isSynthirWorkflow
			? navigate(`/synthirPatient/${id}`)
			: navigate(`/patient/${id}`);
	};

	useEffect(() => {
		if (currentWorkflowClient?.patient?.id) {
			isSynthirWorkflow
				? navigate(`/synthirPatient/${currentWorkflowClient.patient.id}`)
				: navigate(`/patient/${currentWorkflowClient.patient.id}`);
		}
	}, [currentWorkflowClient, navigate]);

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			renderPatient(patientId);
		}
	};

	if (currentWorkflowClient) {
		return (
			<div className="choosePatientWrapper">
				<div className="inputDialog">
					<div className="inputField">
						<label className="inputLabel">
							Search for a patient ID or SSN <br />
							<span>
								(eg. cdp2010051 or 9dbcfce2-2c3a-476a-9b39-eead46d3c725)
							</span>
						</label>
						<input
							type="text"
							onChange={(e) => setPatientId(e.target.value)}
							onKeyDown={(e) => handleKeyDown(e)}
						/>
					</div>
					<button className="dipsPrimaryButton">
						<Link
							className="buttonLink"
							to={
								isSynthirWorkflow
									? `/synthirPatient/${patientId}`
									: `/patient/${patientId}`
							}
						>
							Search
						</Link>
					</button>
				</div>
			</div>
		);
	} else if (!currentWorkflowClient && !clientLoading) {
		return (
			<div className="orange-info-card">
				<div className="text-wrapper">
					<p>Missing access!</p>
					<p>Please restart the app and allow access to all resources.</p>
					<button className="dipsPrimaryButton">
						<Link className="buttonLink" to={`/`}>
							Restart app
						</Link>
					</button>
				</div>
			</div>
		);
	} else {
		return <></>;
	}
};

export default ChoosePatient;
