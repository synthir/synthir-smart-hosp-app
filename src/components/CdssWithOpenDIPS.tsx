import { useContext, useEffect, useState } from "react";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { Link, useParams } from "react-router-dom";
import clientContext from "../context/clientContext";
import LaunchSyntHIR from "./LaunchSyntHIR";
import {
	ICondition,
	IEncounter,
	IMedicationRequest,
} from "@ahryman40k/ts-fhir-types/lib/R4";
import { Container, Button, Row, Col, Modal } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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

	const [prediction, setPrediction] = useState("");
	const [showPrediction, setShowPrediction] = useState(false);
	const handleClosePrediction = () => setShowPrediction(false);
	const handleShowPrediction = () => setShowPrediction(true);
	const { id } = useParams();
	const synthirAccessToken = JSON.parse(
		sessionStorage.getItem("synthirAccessToken") || "{}"
	);
	const [syntHIRDischargeLocation, setSyntHIRDischargeLocation] = useState("1");
	const [syntHIRPatientAgeGroup, setSyntHIRPatientAgeGroup] = useState("2");
	const { client } = useContext(clientContext);

	//patient ID Synthir: 34940 and patient resource ID : 9dbcfce2-2c3a-476a-9b39-eead46d3c725
	//patient ID OpenDIPS: cdp2010051
	const dipsSubscriptionKey = process.env.REACT_APP_DIPS_SUBSCRIPTION_KEY || "";

	useEffect(() => {
		if (client) {
			setLoading(true);
			async function fetchPatient() {
				await client
					.request({
						url: `/Patient/${id}`,
						headers: {
							"dips-subscription-key": dipsSubscriptionKey,
						},
					})
					.then((patient) => {
						setLoading(false);
						setPatient(patient);
						onChangePatientPrediction(
							patient?.gender!,
							patient?.address![0].postalCode
						);
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
							"dips-subscription-key": dipsSubscriptionKey,
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
		if (
			synthirAccessToken != null &&
			Object.keys(synthirAccessToken).length !== 0
		) {
			console.log(Object.keys(synthirAccessToken).length);
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
		const sessionStorageObj = {
			synthirClick: true,
		};
		sessionStorage.setItem(
			"synthirClickKey",
			JSON.stringify(sessionStorageObj)
		);
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
				setPrediction((data.prediction * 100).toFixed(2));
				handleShowPrediction();
			});
	};

	const predictionData = [
		{
			name: "Prediction",
			prediction: prediction,
		},
	];

	const predictionColor = Number(prediction) > 50 ? "red" : "green";

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
					<Button
						className="mb-5"
						size="lg"
						onClick={handleSynthirClick}
						variant="primary"
					>
						Populate data from SyntHIR
					</Button>
					{triggerSyntHIR && <LaunchSyntHIR />}
				</div>
				<Container fluid>
					<div className="patient-details">
						<p>
							<i className="person-icon"></i>
							Patient ID {" : "}
							{patient?.identifier![0].value} is a {patient?.gender!} patient
						</p>
						<p>
							born {patient?.birthDate!} in age group. Born in county {" : "}{" "}
							{patient?.address![0].postalCode}
						</p>
					</div>
					{encounter && (
						<div className="width100">
							<h2 className="mt-5">Hospitalization Details</h2>
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
				{medication && (
					<div className="text-wrapper dropdown-wrapper">
						<div>
							<p>SyntHIR Discharge Location Values</p>
							<select
								className="mb-3"
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
				)}
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
						<BarChart
							width={400}
							height={300}
							data={predictionData}
							margin={{
								top: 5,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis type="number" domain={[0, 100]} />
							<Bar dataKey="prediction" barSize={20} fill={predictionColor} />
						</BarChart>
						The predicted risk of Hospitalization is: {prediction}%
					</Modal.Body>
				</Modal>
			</>
		);
	}

	return <></>;
};

export default Patient;
