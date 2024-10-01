<h2 align="center">
  <img src="README_images/SyntHIR_logo.PNG" height="150px">
</h2>

<h4 align="center">
    Accelerating translation from clinical research to tools
</h4>

## CDSS tool predicting risk of hospitalization

This tool is developed using SMART on FHIR framework, which utilizes a machine learning model for prediction. The machine learning model is hosted on a cloud and the code for the model can be found here: https://github.com/synthir/synthir-smart-model

## Getting Started

If you want to just run the CDSS tool (SMART on FHIR app), should follow the [Run the app using Docker image](#run-the-app-using-docker-image) instructions instead, and to examine or extend the source code, follow [Developer Start Guide](#developer-start-guide) instructions.

### [Run the app using Docker image](#run-the-app-using-docker-image)

The docker image of the app is uploaded on the DockerHub, and docker file is also available in the root directory of the project source code (named as Dockerfile), which needs to be build into a image. The docker image can run on the local machine or on 'play with docker' (https://www.docker.com/play-with-docker/).

To run the dockerfile on the local machine, install docker desktop on windows, linux or mac using the link : https://docs.docker.com/get-docker/. Pull the docker image from docker hub and run it OR Use the dockerfile available in the source code.

To use the docker image from docker hub, pull and run:

```
docker pull synthir21/smartapp:latest
docker run -p 8080:80 synthir21/smartapp:latest
```

To use the dockerfile available in the source code, first clone the repository:

```
git clone https://github.com/synthir/synthir-smart-hosp-app.git
cd synthir-smart-hosp-app
```

Now, build docker image from the dockerfile and run:

```
docker build --tag 'smartapp:latest' .
docker run -p 8080:80 synthir21/smartapp:latest
```

Argument --tag indicates the repository name for the image (smartapp) and tag is latest; 80 is the port number on which the application is running in the container and 8080 is the port number mapped to 80 port of the container.

### [Developer Start Guide](#developer-start-guide)

To run the app on your local machine, Clone the repo and then build and run the application

1. git clone https://github.com/synthir/synthir-smart-hosp-app
2. cd synthir-smart-hosp-app
3. npm install
4. npm start

### [CDSS tool on cloud](#cdss-tool-on-cloud)

The app is also deployed on a cloud and can be accessed using the URL : https://synthirsmartapphospprediction.azurewebsites.net/. The steps for using the application are as follows:

1. Open your web browser and navigate to the [Cloud Application URL](https://synthirsmartapphospprediction.azurewebsites.net/)
2. There are two options for using the application: SyntHIR [CDSS tool that connects only to SyntHIR server](#cdss-tool-connects-only-to-synthir) and SyntHIR with Open DIPS [CDSS tool that connects to both SyntHIR and Open DIPS](#cdss-tool-connects-to-synthir-and-open-dips)

##### [CDSS tool connects only to SyntHIR](#cdss-tool-connects-only-to-synthir)

1.  Click on button 'SyntHIR', enter the user credentials

```
Username : synthiruser@outlook.com
Password : Synthirtestuser
```

2.  It will authenticate with SyntHIR server and land on the search patient page. Search Patient using the patient ID _9dbcfce2-2c3a-476a-9b39-eead46d3c725_.
3.  It will fetch hospitalization and prescriptions for that patient ID. If you click on the hospitalization box, it will fetch corresponding conditions. Similarly, clicking on prescription box, will fetch medication code for that prescription.
4.  To get the risk of hospitalization, select hospitalization, condition, prescription and medication by clicking on the radio button of the respective boxes and then click on 'Predict' button.

##### [CDSS tool connects to SyntHIR and Open DIPS](#cdss-tool-connects-to-synthir-and-open-dips)

1.  Click on button 'SyntHIR with Open DIPS', enter the user credentials

```
Username: OPENDIPS
Password: OPEN DIPS
```

2.  It will first authenticate with Open DIPS server and land on the search patient page. Search Patient using the patient ID _cdp2014109_.
3.  It will fetch hospitalization for that patient ID. If you click on the hospitalization box, it will fetch corresponding conditions. To fetch prescriptions and medication related information, click on button 'Populate with SyntHIR' and enter the above mentioned user credentials for SyntHIR.
4.  Once authenticated with SyntHIR server, it will again land on search patient page. Enter the patient ID _cdp2014109_. It will fetch hospitalizations from Open DIPS and prescriptions from SyntHIR server. When you Click on prescription box, will fetch medication code for that prescription.
5.  To get the risk of hospitalization, select hospitalization, condition, prescription and medication by clicking on the radio button of the respective boxes and then click on Predict button
