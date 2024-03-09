import { useEffect, useState } from "react";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { Link, useParams } from "react-router-dom";
import { Container, Button, Row, Col, Modal } from "react-bootstrap";
import SimpleBar from "simplebar-react";
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

	const [prediction, setPrediction] = useState("");
	const [showPrediction, setShowPrediction] = useState(false);
	const handleClosePrediction = () => setShowPrediction(false);
	const handleShowPrediction = () => setShowPrediction(true);
	const { id } = useParams();
	const synthirAccessToken = JSON.parse(
		sessionStorage.getItem("synthirAccessToken") || "{}"
	);
	//const { client } = useContext(clientContext);

	//patient ID Synthir: 34940 and patient resource ID : 9dbcfce2-2c3a-476a-9b39-eead46d3c725
	//patient ID OpenDIPS: cdp2010051
	useEffect(() => {
		async function fetchPatientFromSyntHIR() {
			const fetchPatientResourceAPIUrl = `https://synthir-test-fhir-server.azurehealthcareapis.com/Patient/${id}`;
			await fetch(fetchPatientResourceAPIUrl, {
				headers: { Authorization: "Bearer " + synthirAccessToken },
			})
				.then((response) => {
					return response.json();
				})
				.then((patientSyntHIR) => {
					setPatient(patientSyntHIR);
					onChangePatientPrediction(
						patientSyntHIR?.gender!,
						patientSyntHIR?.extension![0].valueString,
						patientSyntHIR?.address![0].postalCode
					);
				})
				.catch((error) => {
					setLoading(false);
					//setError(error);
					//console.error;
				});
		}
		fetchPatientFromSyntHIR();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (patient?.id) {
			async function fetchEncounterRequest() {
				const fetchEncounterRequestResourceAPIUrl = `https://synthir-test-fhir-server.azurehealthcareapis.com/Encounter?patient=${patient?.id}`;
				fetch(fetchEncounterRequestResourceAPIUrl, {
					headers: { Authorization: "Bearer " + synthirAccessToken },
				})
					.then((response) => {
						return response.json();
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
			fetchEncounterRequest();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patient]);

	useEffect(() => {
		if (synthirAccessToken != null) {
			async function fetchMedicationRequest() {
				const fetchMedicationRequestResourceAPIUrl = `https://synthir-test-fhir-server.azurehealthcareapis.com/MedicationRequest?patient=${id}`;
				fetch(fetchMedicationRequestResourceAPIUrl, {
					headers: { Authorization: "Bearer " + synthirAccessToken },
				})
					.then((response) => {
						return response.json();
					})
					.then((medicationRequest) => {
						setLoading(false);
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
	}, [patient]);

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
		if (synthirAccessToken != null) {
			async function fetchCondition() {
				const fetchEncounterResourceAPIUrl = `https://synthir-test-fhir-server.azurehealthcareapis.com/Condition?patient=${patient?.id}&encounter=${encounterResourceId}`;
				fetch(fetchEncounterResourceAPIUrl, {
					headers: { Authorization: "Bearer " + synthirAccessToken },
				})
					.then((response) => {
						return response.json();
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
		}
	};
	const onChangePatientPrediction = (
		patientGender: string,
		patientAgeGroup: string | undefined,
		patientPostalCode: string | undefined
	) => {
		//Check patient gender; male=1, female=2
		const gender = patientGender === "male" ? "1" : "2";
		setModelPredictionParams({
			...modelPredictionParams,
			patientGender: gender,
			patientAgeGroup: patientAgeGroup,
			patientPostalCode: patientPostalCode,
		});
	};

	const onChangeEncounterPrediction = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setEncounterRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			encounterDischargeLocation:
				event.target.getAttribute("data-resourceparam-encounter-disloc") || "",
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
				setPrediction(data.prediction);
				handleShowPrediction();
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
				<Container fluid>
					<div className="patient-details">
						<p>
							<i className="person-icon"></i>
							Patient ID {" : "}
							{patient?.identifier![0].value} is a {patient?.gender!} patient
						</p>
						<p>
							born in {patient?.birthDate!} in age group{" "}
							{patient?.extension![0].valueString}. Born in county {" : "}{" "}
							{patient?.address![0].postalCode}
						</p>
					</div>
					{encounter && (
						<div className="width100">
							<h2>Hospitalization Details</h2>
							<SimpleBar>
								<Row className="pb-5  flex-nowrap">
									{encounter?.entry?.map((encounterEntry) => {
										const encounterEntryResource =
											encounterEntry.resource as IEncounter;
										return (
											<Col xs={2} className="me-2">
												<div
													key={encounterEntry?.resource?.id}
													className="blue-info-card"
													onClick={() => {
														handleEncounterEvent(encounterEntryResource.id);
													}}
												>
													<div className="text-wrapper">
														<input
															type="radio"
															value={encounterEntryResource.id}
															name="encounter"
															data-resourceparam={encounterEntryResource.status}
															data-resourceparam-encounter-disloc={
																encounterEntryResource.hospitalization
																	?.dischargeDisposition?.text
															}
															onChange={onChangeEncounterPrediction}
															onClick={(event) => event.stopPropagation()}
															checked={
																encounterRadio === encounterEntry?.resource?.id
															}
														/>
														<p> Status : {encounterEntryResource.status}</p>
														<p>
															{" "}
															Start date :{" "}
															{encounterEntryResource?.period?.start} and end
															date : {encounterEntryResource?.period?.end}
														</p>
													</div>
												</div>
											</Col>
										);
									})}
								</Row>
							</SimpleBar>
						</div>
					)}
					{condition && (
						<div className="width100">
							<h2 className="mt-4">Condition</h2>
							<SimpleBar>
								<Row className="pb-5  flex-nowrap">
									{condition?.entry?.map((conditionEntry) => {
										const conditionEntryResource =
											conditionEntry.resource as ICondition;
										return (
											<Col xs={2} className="me-3">
												<div
													key={conditionEntryResource.id}
													className="blue-info-card"
												>
													<div className="text-wrapper">
														<input
															type="radio"
															value={conditionEntryResource.id}
															name="condition"
															data-resourceparam={
																conditionEntryResource.code?.coding![0].code
															}
															onChange={onChangeConditionPrediction}
															onClick={(event) => event.stopPropagation()}
															checked={
																conditionRadio === conditionEntryResource.id
															}
														/>
														<p>
															Main Diagnosis code {" : "}{" "}
															{conditionEntryResource.code?.coding![0].code}
														</p>
													</div>
												</div>
											</Col>
										);
									})}
								</Row>
							</SimpleBar>
						</div>
					)}

					{medicationRequest && (
						<div className="width100">
							<h2 className="mt-4">Prescriptions</h2>
							<SimpleBar>
								<Row className="pb-5 flex-nowrap">
									{medicationRequest?.entry?.map((medicationRequestEntry) => {
										const medicationRequestEntryResource =
											medicationRequestEntry.resource as IMedicationRequest;
										return (
											medicationRequestEntryResource?.note?.[0].text !==
												undefined && (
												<Col xs={2} className="me-3">
													<div
														key={medicationRequestEntryResource.id}
														className="blue-info-card"
														onClick={() => {
															handleMedicationRequestEvent(
																medicationRequestEntryResource
																	?.medicationReference?.identifier?.value
																//medicationRequestEntry.resource.note[1].text
															);
														}}
													>
														<div className="text-wrapper">
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
															<p>
																Prescription category {" : "}{" "}
																{medicationRequestEntryResource?.note?.[0].text}
																with code :{" "}
																{medicationRequestEntryResource?.note?.[1].text}
															</p>
														</div>
													</div>
												</Col>
											)
										);
									})}
								</Row>
							</SimpleBar>
						</div>
					)}
					{medication && (
						<div className="width100">
							<h2 className="mt-4">Medication</h2>
							<Row className="pb-5 flex-nowrap">
								<Col xs={2} className="me-3">
									<div className="blue-info-card">
										<div className="text-wrapper">
											<input
												type="radio"
												value={medication?.id}
												name="medication"
												data-resourceparam={medication?.code?.coding![0].code}
												onChange={onChangeMedicationPrediction}
												onClick={(event) => event.stopPropagation()}
												checked={medicationRadio === medication?.id}
											/>

											<p>
												Medication {" : "} {medication?.code?.text} with ICD-10
												code as {" : "} {medication?.code?.coding![0].code}
											</p>
										</div>
									</div>
								</Col>
							</Row>
						</div>
					)}
				</Container>
				<div className="button-wrapper">
					<div>
						<Button
							className="mb-5"
							size="lg"
							onClick={fetchPrediction}
							variant="primary"
						>
							Predict Risk
						</Button>
					</div>
				</div>

				<Modal
					show={showPrediction}
					onHide={handleClosePrediction}
					backdrop="static"
				>
					<Modal.Header closeButton></Modal.Header>
					<Modal.Body>
						The predicted risk of Hospitalization is: {prediction}
					</Modal.Body>
				</Modal>
			</>
		);
	}

	return <></>;
};

export default Patient;
