import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import "./styles/app.scss";
import "./styles/choosePatient.scss";
import "./styles/header.scss";
import "./styles/notfound.scss";
import Header from "./components/Header";
import "simplebar-react/dist/simplebar.min.css";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<React.StrictMode>
		<Header />
		<App />
	</React.StrictMode>
);
