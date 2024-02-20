import { useContext, useEffect, useState } from "react";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { Link, useParams } from "react-router-dom";
import clientContext from "../context/clientContext";
import Launch1 from "./Launch1";
// import Modal from "react-bootstrap/Modal";
import {
	ICondition,
	IEncounter,
	IMedicationRequest,
} from "@ahryman40k/ts-fhir-types/lib/R4";

const Patient: React.FC = () => {
	const [patient, setPatient] = useState<R4.IPatient | undefined>();
	const [encounter, setEncounter] = useState<R4.IBundle | undefined>();
	const [condition, setCondition] = useState<R4.IBundle | undefined>();
	const [medicationRequest, setMedicationRequest] = useState<
		R4.IBundle | undefined
	>();
	const [medication, setMedication] = useState<R4.IMedication | undefined>();
	const [encounterRadio, setEncounterRadio] = useState("");
	const [conditionRadio, setConditionRadio] = useState("");
	const [medicationRequestRadio, setMedicationRequestRadio] = useState("");
	const [medicationRadio, setMedicationRadio] = useState("");
	const [loading, setLoading] = useState<boolean>(false);
	//const [error, setError] = useState<string | undefined>(undefined);
	const [triggerSyntHIR, setTriggerSyntHIR] = useState<boolean>(false);
	const [modelPredictionParams, setModelPredictionParams] = useState<{
		[key: string]: string | undefined;
	}>({
		patientGender: "",
		patientAgeGroup: "",
		patientPostalCode: "",
		conditionDiagnosisCode: "",
		encounterStatus: "",
		encounterDischargeLocation: "",
		medicationATCCode: "",
		medicationRequestCategoryCode: "",
	});

	//const [prediction, setPrediction] = useState("");
	// const [showPrediction, setShowPrediction] = useState(false);
	// const handleClosePrediction = () => setShowPrediction(false);
	// const handleShowPrediction = () => setShowPrediction(true);
	const { id } = useParams();
	const synthirAccessToken = JSON.parse(
		localStorage.getItem("synthirAccessToken") || "{}"
	);
	const [syntHIRDischargeLocation, setSyntHIRDischargeLocation] = useState("1");
	const [syntHIRPatientAgeGroup, setSyntHIRPatientAgeGroup] = useState("2");

	const { client } = useContext(clientContext);

	//patient ID Synthir: 34940 and patient resource ID : 9dbcfce2-2c3a-476a-9b39-eead46d3c725
	//patient ID OpenDIPS: cdp2010051

	useEffect(() => {
		if (client) {
			setLoading(true);
			async function fetchPatient() {
				await client
					.request({
						url: `/Patient/${id}`,
						headers: {
							"dips-subscription-key": "edffd088cc944c8fb50ffd26894aa444",
						},
					})
					.then((patient) => {
						setLoading(false);
						setPatient(patient);
					})
					.catch((error) => {
						setLoading(false);
						//setError(error);
						// console.error;
					});
			}

			fetchPatient();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [client]);

	useEffect(() => {
		if (patient?.id) {
			async function fetchEncounter() {
				await client
					.request({
						url: `/Encounter?patient=${patient?.id}`,
						headers: {
							"dips-subscription-key": "edffd088cc944c8fb50ffd26894aa444",
						},
					})
					.then((encounter) => {
						setLoading(false);
						setEncounter(encounter);
					})
					.catch((error) => {
						setLoading(false);
						//setError(error);
						//console.error;
					});
			}
			fetchEncounter();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patient]);

	useEffect(() => {
		if (synthirAccessToken != null) {
			async function fetchMedicationRequest() {
				const fetchMedicationRequestResourceAPIUrl =
					"https://synthir-test-fhir-server.azurehealthcareapis.com/MedicationRequest";
				fetch(fetchMedicationRequestResourceAPIUrl, {
					headers: { Authorization: "Bearer " + synthirAccessToken },
				})
					.then((response) => {
						return response.json();
					})
					.then((medicationRequest) => {
						setMedicationRequest(medicationRequest);
					})
					.catch((error) => {
						setLoading(false);
						//setError(error);
						//console.error;
					});
			}
			fetchMedicationRequest();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleMedicationRequestEvent = (
		medicationRequestResourecId: string | undefined
	) => {
		if (synthirAccessToken != null) {
			async function fetchMedication() {
				const fetchEncounterResourceAPIUrl =
					"https://synthir-test-fhir-server.azurehealthcareapis.com/Medication/" +
					medicationRequestResourecId;
				fetch(fetchEncounterResourceAPIUrl, {
					headers: { Authorization: "Bearer " + synthirAccessToken },
				})
					.then((response) => {
						return response.json();
					})
					.then((medication) => {
						setMedication(medication);
					})
					.catch((error) => {
						setLoading(false);
						//setError(error);
						//console.error;
					});
			}
			fetchMedication();
		}
	};

	const handleEncounterEvent = (encounterResourceId: string | undefined) => {
		console.log(encounterResourceId);
		async function fetchCondition() {
			await client
				.request({
					url: `/Condition?patient=${patient?.id}&encounter=${encounterResourceId}`,
					headers: {
						"dips-subscription-key": "edffd088cc944c8fb50ffd26894aa444",
					},
				})
				.then((condition) => {
					setLoading(false);
					setCondition(condition);
				})
				.catch((error) => {
					setLoading(false);
					//setError(error);
					//console.error;
				});
		}
		fetchCondition();
	};
	const onChangePatientPrediction = (
		patientGender: string,
		patientPostalCode: string | undefined
	) => {
		//Check patient gender; male=1, female=2
		const gender = patientGender === "male" ? "1" : "2";
		setModelPredictionParams({
			...modelPredictionParams,
			patientGender: gender,
			patientPostalCode: patientPostalCode,
		});
	};

	const onChangeEncounterPrediction = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setEncounterRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			encounterStatus: event.target.getAttribute("data-resourceparam") || "",
		});
	};
	const onChangeConditionPrediction = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setConditionRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			conditionDiagnosisCode:
				event.target.getAttribute("data-resourceparam") || "",
		});
	};
	const onChangeMedicationRequestPrediction = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		event.stopPropagation();
		setMedicationRequestRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			medicationRequestCategoryCode:
				event.target.getAttribute("data-resourceparam") || "",
		});
	};
	const onChangeMedicationPrediction = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		event.stopPropagation();
		setMedicationRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			medicationATCCode: event.target.getAttribute("data-resourceparam") || "",
		});
	};

	const handleChangeSyntHIRDischargeLocation = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		setSyntHIRDischargeLocation(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			encounterDischargeLocation: event.target.value,
		});
	};

	const handleChangeSyntHIRPatientAgeGroup = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		setSyntHIRPatientAgeGroup(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			patientAgeGroup: event.target.value,
		});
	};

	const handleSynthirClick = () => {
		localStorage.setItem("synthirClick", "true");
		setTriggerSyntHIR(true);
	};

	const fetchPrediction = () => {
		console.log(modelPredictionParams);
		fetch(
			"https://predictmodelapi.azurewebsites.net/predict?Sex=" +
				modelPredictionParams.patientGender +
				"&Age_Group= " +
				modelPredictionParams.patientAgeGroup +
				"&County=" +
				modelPredictionParams.patientPostalCode +
				"&Main_Diagnosis=" +
				modelPredictionParams.conditionDiagnosisCode +
				"&Arrival_Mode=" +
				modelPredictionParams.encounterStatus +
				"&Discharge_To=" +
				modelPredictionParams.encounterDischargeLocation +
				"&ATC_Code=" +
				modelPredictionParams.medicationATCCode +
				"&Prescribtion_Type=" +
				modelPredictionParams.medicationRequestCategoryCode,
			{ method: "GET" }
		)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
				//setPrediction(data.prediction);
				//handleShowPrediction();
			});
	};

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
			<>
				<div className="align-right padding-right">
					<button className="dipsPrimaryButton" onClick={handleSynthirClick}>
						Populate data from SyntHIR
					</button>
					{triggerSyntHIR && <Launch1 />}
				</div>
				<div className="container">
					<div className="wrapper">
						<div
							className="blue-info-card"
							onClick={() => {
								onChangePatientPrediction(
									patient?.gender!,
									patient?.address![0].postalCode
								);
							}}
						>
							<div className="text-wrapper">
								<i className="person-icon"></i>
								<p className="card-name"></p>
								<p>
									Patient ID {" : "}
									{patient?.identifier![0].value} is a {patient?.gender!}{" "}
									patient born {patient?.birthDate!} in age group. Born in
									county {" : "} {patient?.address![0].postalCode}
								</p>
							</div>
						</div>
						{encounter?.entry?.map((encounterEntry) => {
							const encounterEntryResource =
								encounterEntry.resource as IEncounter;
							return (
								<div
									key={encounterEntry?.resource?.id}
									className="blue-info-card"
									onClick={() => {
										handleEncounterEvent(encounterEntryResource.id);
									}}
								>
									<div className="text-wrapper">
										<i className="document-icon"></i>
										<input
											type="radio"
											value={encounterEntryResource.id}
											name="encounter"
											data-resourceparam={encounterEntryResource.status}
											onChange={onChangeEncounterPrediction}
											onClick={(event) => event.stopPropagation()}
											checked={encounterRadio === encounterEntry?.resource?.id}
										/>
										<p className="card-name">Hospitalization Details</p>
										<p> Status : {encounterEntryResource.status}</p>
										<p>
											{" "}
											Start date : {encounterEntryResource?.period?.start} and
											end date : {encounterEntryResource?.period?.end}
										</p>
									</div>
								</div>
							);
						})}
						{condition &&
							condition?.entry?.map((conditionEntry) => {
								const conditionEntryResource =
									conditionEntry.resource as ICondition;
								return (
									<div
										key={conditionEntryResource.id}
										className="blue-info-card"
									>
										<div className="text-wrapper">
											<i className="document-icon"></i>
											<input
												type="radio"
												value={conditionEntryResource.id}
												name="condition"
												data-resourceparam={
													conditionEntryResource.code?.coding![0].code
												}
												onChange={onChangeConditionPrediction}
												onClick={(event) => event.stopPropagation()}
												checked={conditionRadio === conditionEntryResource.id}
											/>
											<p className="card-name">Condition</p>
											<p>
												Main Diagnosis code {" : "}{" "}
												{conditionEntryResource.code?.coding![0].code}
											</p>
										</div>
									</div>
								);
							})}
					</div>

					<div className="wrapper">
						{medicationRequest?.entry?.map((medicationRequestEntry) => {
							const medicationRequestEntryResource =
								medicationRequestEntry.resource as IMedicationRequest;
							return (
								<div
									key={medicationRequestEntryResource.id}
									className="blue-info-card"
									onClick={() => {
										handleMedicationRequestEvent(
											medicationRequestEntryResource?.medicationReference
												?.identifier?.value
											//medicationRequestEntry.resource.note[1].text
										);
									}}
								>
									<div className="text-wrapper">
										<i className="document-icon"></i>
										<input
											type="radio"
											value={medicationRequestEntryResource.id}
											name="medicationRequest"
											data-resourceparam={
												medicationRequestEntryResource?.note?.[1].text
											}
											onChange={onChangeMedicationRequestPrediction}
											onClick={(event) => event.stopPropagation()}
											checked={
												medicationRequestRadio ===
												medicationRequestEntryResource.id
											}
										/>
										<p className="card-name">Prescriptions</p>
										<p>
											Prescription category {" : "}{" "}
											{medicationRequestEntryResource?.note?.[0].text}
											with code :{" "}
											{medicationRequestEntryResource?.note?.[1].text}
										</p>
									</div>
								</div>
							);
						})}
						<div className="blue-info-card">
							<div className="text-wrapper">
								<i className="document-icon"></i>
								<input
									type="radio"
									value={medication?.id}
									name="medication"
									data-resourceparam={medication?.code?.coding![0].code}
									onChange={onChangeMedicationPrediction}
									onClick={(event) => event.stopPropagation()}
									checked={medicationRadio === medication?.id}
								/>
								<p className="card-name">Medication</p>
								<p>
									Medication {" : "} {medication?.code?.text} with ICD-10 code
									as {" : "} {medication?.code?.coding![0].code}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="text-wrapper dropdown-wrapper">
					<div>
						<p>SyntHIR Discharge Location Values</p>
						<select
							value={syntHIRDischargeLocation}
							onChange={handleChangeSyntHIRDischargeLocation}
						>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
						</select>
					</div>
					<div>
						<p>SyntHIR Patient Age Group</p>
						<select
							value={syntHIRPatientAgeGroup}
							onChange={handleChangeSyntHIRPatientAgeGroup}
						>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
							<option value="6">6</option>
						</select>
					</div>
				</div>
				<div className="button-wrapper">
					<div>
						<button className="dipsPrimaryButton" onClick={fetchPrediction}>
							Predict Risk
						</button>
					</div>
				</div>
				{/* <Modal
					show={showPrediction}
					onHide={handleClosePrediction}
					backdrop="static"
				>
					<Modal.Header closeButton></Modal.Header>
					<Modal.Body>
						The predicted risk of Hospitalization is: {prediction}
					</Modal.Body>
				</Modal> */}
			</>
		);
	}

	return <></>;
};

export default Patient;
