import { useContext, useEffect, useState } from "react";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { Link, useParams } from "react-router-dom";
import clientContext from "../context/clientContext";

const Patient: React.FC = () => {
	const [patient, setPatient] = useState<R4.IPatient | undefined>();
	const [encounter, setEncounter] = useState<R4.IBundle | undefined>();
	const [condition, setCondition] = useState<R4.ICondition | undefined>();
	const [medicationRequest, setMedicationRequest] = useState<R4.IMedicationRequest | undefined>();
	const [medication, setMedication] = useState<R4.IMedication | undefined>();
	const [loading, setLoading] = useState<boolean>(false);
	//const [documents, setDocuments] = useState<R4.IBundle | undefined>();
	const [error, setError] = useState<string | undefined>(undefined);

	const { id } = useParams();

	const { client } = useContext(clientContext);

	//patient ID Synthir: 34940 and patient resource ID : 9dbcfce2-2c3a-476a-9b39-eead46d3c725
	//patient ID OpenDIPS: cdp2010051
	useEffect(() => {
		if (client) {
			setLoading(true);
			async function fetchPatient() {
				await client.request({
					url: `/Patient/${id}`,
					// headers: {
					// 	"dips-subscription-key": import.meta.env.VITE_DIPS_SUBSCRIPTION_KEY,
					// },
				})
					.then((patient) => {
						setLoading(false);
						setPatient(patient);
					})
					.catch((error) => {
						setLoading(false);
						setError(error);
						console.error;
					});
			}

			fetchPatient();
		}
	}, [client]);

	useEffect(() => {
		if (patient?.id) {
			async function fetchEncounter() {
				await client.request({
					url: `/Encounter?patient=${patient?.id}`,
					// headers: {
					// 	"dips-subscription-key": import.meta.env.VITE_DIPS_SUBSCRIPTION_KEY,
					// },
				})
					.then((encounter) => {
						setLoading(false);
						setEncounter(encounter?.entry);
					})
					.catch((error) => {
						setLoading(false);
						setError(error);
						console.error;
					});
			}
			fetchEncounter();
		}
	}, [patient]);

	const handleEncounterEvent = (encounterResourceId:String) => {
		async function fetchCondition() {
			await client.request({
				url: `/Condition?patient=${patient?.id}&encounter=${encounterResourceId}`,
				// headers: {
				// 	"dips-subscription-key": import.meta.env.VITE_DIPS_SUBSCRIPTION_KEY,
				// },
			})
				.then((condition) => {
					setLoading(false);
					setCondition(condition?.entry);
				})
				.catch((error) => {
					setLoading(false);
					setError(error);
					console.error;
				});
		}
		fetchCondition();

		async function fetchMedicationRequest() {
			await client.request({
				url: `/MedicationRequest?encounter=${encounterResourceId}`,
				// headers: {
				// 	"dips-subscription-key": import.meta.env.VITE_DIPS_SUBSCRIPTION_KEY,
				// },
			})
				.then((medicationRequest) => {
					setLoading(false);
					setMedicationRequest(medicationRequest?.entry[0].resource);
				})
				.catch((error) => {
					setLoading(false);
					setError(error);
					console.error;
				});
		}
		fetchMedicationRequest();

		async function fetchMedication() {
			await client.request({
				url: `/Medication/${medicationRequest?.medicationReference?.identifier?.value}`,
				// headers: {
				// 	"dips-subscription-key": import.meta.env.VITE_DIPS_SUBSCRIPTION_KEY,
				// },
			})
				.then((medication) => {
					setLoading(false);
					setMedication(medication);
				})
				.catch((error) => {
					setLoading(false);
					setError(error);
					console.error;
				});
		}
		fetchMedication();
	}


	if (loading) {
		return <></>;
	}

	if (!loading && !patient) {
		return (
			<div className="wrapper">
				<div className="orange-info-card">
					<div className="text-wrapper">
						<p>No patient found with ID: {id}</p>
						<button className="dipsPrimaryButton">
							<Link className="buttonLink" to={`/app`}>
								Return to search
							</Link>
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (patient && encounter) {
		return (
			<div className="wrapper">
				<div className="blue-info-card">
					<div className="text-wrapper">
						<i className="person-icon">
						</i>
						<p className="card-name">
						</p>
						<p>
							Patient ID {" : "}{patient?.identifier![0].value} is a{" "}
							{patient?.gender!} patient born {patient?.birthDate!} in age group.
							Born in county {" : "} {patient?.address![0].postalCode}
						</p>
					</div>
				</div>
				{encounter.map((encounterEntry) => {
					return (
						<div key = {encounterEntry.resource.id} className="blue-info-card" onClick={() => {handleEncounterEvent(encounterEntry.resource.id)}}>
							<div className="text-wrapper">
								<i className="document-icon">
								</i>
								<p className="card-name">Hospitalization Details</p>
									<p> Status : {encounterEntry.resource.status }</p>
									<p> Start date : {encounterEntry.resource.period.start}  and end date : {encounterEntry.resource.period.end}</p>	
							</div>
						</div>
					)})
				}
				{condition?.map((conditionEntry) => {
					return (
						<div key = {conditionEntry.resource.id} className="blue-info-card">
							<div className="text-wrapper">
								<i className="document-icon">
								</i>
								<p className="card-name">Condition</p>
								<p>
									Main Diagnosis code {" : "} {conditionEntry.resource?.code?.coding![0].code} 
								</p>
							</div>
						</div>
				)})
				}
				<div className="blue-info-card">
					<div className="text-wrapper">
						<i className="document-icon">
						</i>
						<p className="card-name">Prescription</p>
						<p>
							Prescription Type {" : "} {medicationRequest?.note[1].text} 
						</p>
					</div>
				</div>
				<div className="blue-info-card">
					<div className="text-wrapper">
						<i className="document-icon">
						</i>
						<p className="card-name">Medication</p>
						<p>
							Medication {" : "} {medication?.code?.text} with 
							ICD-10 code as {" : "} {medication?.code?.coding![0].code}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return <></>;
};

export default Patient;