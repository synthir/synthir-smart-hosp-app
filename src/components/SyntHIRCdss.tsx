import { useContext, useEffect, useState } from "react";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { Link, useParams } from "react-router-dom";
import clientContext from "../context/clientContext";
import Launch1 from "./Launch1";

const Patient: React.FC = () => {
	const [patient, setPatient] = useState<R4.IPatient | undefined>();
	const [encounter, setEncounter] = useState<R4.IBundle | undefined>();
	const [condition, setCondition] = useState<R4.ICondition | undefined>();
	const [medicationRequest, setMedicationRequest] = useState<
		R4.IBundle | undefined
	>();
	const [medication, setMedication] = useState<R4.IMedication | undefined>();
	const [encounterRadio, setEncounterRadio] = useState("");
	const [conditionRadio, setConditionRadio] = useState();
	const [medicationRequestRadio, setMedicationRequestRadio] = useState();
	const [medicationRadio, setMedicationRadio] = useState();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [triggerSyntHIR, setTriggerSyntHIR] = useState<boolean>(false);
	const [modelPredictionParams, setModelPredictionParams] = useState({
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
	const { id } = useParams();
	const synthirAccessToken = JSON.parse(
		localStorage.getItem("synthirAccessToken")
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
							"dips-subscription-key": import.meta.env
								.VITE_DIPS_SUBSCRIPTION_KEY,
						},
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
				await client
					.request({
						url: `/Encounter?patient=${patient?.id}`,
						headers: {
							"dips-subscription-key": import.meta.env
								.VITE_DIPS_SUBSCRIPTION_KEY,
						},
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
						setMedicationRequest(medicationRequest.entry);
					})
					.catch((error) => {
						setLoading(false);
						setError(error);
						console.error;
					});
			}
			fetchMedicationRequest();
		}
	}, []);

	const handleMedicationRequestEvent = (
		medicationRequestResourecId: String
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
						setError(error);
						console.error;
					});
			}
			fetchMedication();
		}
	};

	const handleEncounterEvent = (encounterResourceId: String) => {
		console.log(encounterResourceId);
		async function fetchCondition() {
			await client
				.request({
					url: `/Condition?patient=${patient?.id}&encounter=${encounterResourceId}`,
					headers: {
						"dips-subscription-key": import.meta.env.VITE_DIPS_SUBSCRIPTION_KEY,
					},
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
	};
	const onChangePatientPrediction = (
		patientGender: string,
		patientPostalCode: string
	) => {
		//Check patient gender; male=1, female=2
		const gender = patientGender === "male" ? "1" : "2";
		setModelPredictionParams({
			...modelPredictionParams,
			patientGender: gender,
			patientPostalCode: patientPostalCode,
		});
	};

	const onChangeEncounterPrediction = (event) => {
		setEncounterRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			encounterStatus: event.target.getAttribute("data-resourceparam"),
		});
	};
	const onChangeConditionPrediction = (event) => {
		setConditionRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			conditionDiagnosisCode: event.target.getAttribute("data-resourceparam"),
		});
	};
	const onChangeMedicationRequestPrediction = (event) => {
		event.stopPropagation();
		setMedicationRequestRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			medicationRequestCategoryCode:
				event.target.getAttribute("data-resourceparam"),
		});
	};
	const onChangeMedicationPrediction = (event) => {
		event.stopPropagation();
		setMedicationRadio(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			medicationATCCode: event.target.getAttribute("data-resourceparam"),
		});
	};

	const handleChangeSyntHIRDischargeLocation = (event) => {
		setSyntHIRDischargeLocation(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			encounterDischargeLocation: event.target.value,
		});
	};

	const handleChangeSyntHIRPatientAgeGroup = (event) => {
		setSyntHIRPatientAgeGroup(event.target.value);
		setModelPredictionParams({
			...modelPredictionParams,
			patientAgeGroup: event.target.value,
		});
	};

	const handleSynthirClick = () => {
		localStorage.setItem("synthirClick", true);
		setTriggerSyntHIR(true);
	};

	const fetchPrediction = () => {
		console.log(modelPredictionParams);
		fetch(
			"http://127.0.0.1:19890/predict?Sex=" +
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
						{encounter.map((encounterEntry) => {
							return (
								<div
									key={encounterEntry.resource.id}
									className="blue-info-card"
									onClick={() => {
										handleEncounterEvent(encounterEntry.resource.id);
									}}
								>
									<div className="text-wrapper">
										<i className="document-icon"></i>
										<input
											type="radio"
											value={encounterEntry.resource.id}
											name="encounter"
											data-resourceparam={encounterEntry.resource.status}
											onChange={onChangeEncounterPrediction}
											onClick={(event) => event.stopPropagation()}
											checked={encounterRadio === encounterEntry.resource.id}
										/>
										<p className="card-name">Hospitalization Details</p>
										<p> Status : {encounterEntry.resource.status}</p>
										<p>
											{" "}
											Start date : {encounterEntry.resource.period.start} and
											end date : {encounterEntry.resource.period.end}
										</p>
									</div>
								</div>
							);
						})}
						{condition &&
							condition?.map((conditionEntry) => {
								return (
									<div
										key={conditionEntry.resource.id}
										className="blue-info-card"
									>
										<div className="text-wrapper">
											<i className="document-icon"></i>
											<input
												type="radio"
												value={conditionEntry.resource.id}
												name="condition"
												data-resourceparam={
													conditionEntry.resource?.code?.coding![0].code
												}
												onChange={onChangeConditionPrediction}
												onClick={(event) => event.stopPropagation()}
												checked={conditionRadio === conditionEntry.resource.id}
											/>
											<p className="card-name">Condition</p>
											<p>
												Main Diagnosis code {" : "}{" "}
												{conditionEntry.resource?.code?.coding![0].code}
											</p>
										</div>
									</div>
								);
							})}
					</div>

					<div className="wrapper">
						{medicationRequest?.map((medicationRequestEntry) => {
							return (
								<div
									key={medicationRequestEntry.resource.id}
									className="blue-info-card"
									onClick={() => {
										handleMedicationRequestEvent(
											medicationRequestEntry.resource.medicationReference
												?.identifier?.value
											//medicationRequestEntry.resource.note[1].text
										);
									}}
								>
									<div className="text-wrapper">
										<i className="document-icon"></i>
										<input
											type="radio"
											value={medicationRequestEntry.resource.id}
											name="medicationRequest"
											data-resourceparam={
												medicationRequestEntry.resource.note[1].text
											}
											onChange={onChangeMedicationRequestPrediction}
											onClick={(event) => event.stopPropagation()}
											checked={
												medicationRequestRadio ===
												medicationRequestEntry.resource.id
											}
										/>
										<p className="card-name">Prescriptions</p>
										<p>
											Prescription category {" : "}{" "}
											{medicationRequestEntry.resource.note[0].text}
											with code : {medicationRequestEntry.resource.note[1].text}
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
						<button className="dipsPrimaryButton" onClick={handleSynthirClick}>
							Populate data from SyntHIR
						</button>
						{triggerSyntHIR && <Launch1 />}
					</div>
					<div>
						<button className="dipsPrimaryButton" onClick={fetchPrediction}>
							Predict Risk
						</button>
						{<p> Risk of Hospitalization : {prediction}</p>}
					</div>
				</div>
			</>
		);
	}

	return <></>;
};

export default Patient;
