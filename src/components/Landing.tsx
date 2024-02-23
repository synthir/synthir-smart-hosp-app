import React from "react";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
	const navigate = useNavigate();

	const handleSyntHIRClick = () => {
		const sessionStorageObj = {
			synthirClick: true,
			synthirWorkflow: true,
		};
		sessionStorage.setItem(
			"synthirClickKey",
			JSON.stringify(sessionStorageObj)
		);
		navigate("/LaunchSyntHIR");
	};

	const handleSyntHIRWithDIPSClick = () => {
		navigate("/LaunchOpenDIPS");
	};

	return (
		<div>
			<button onClick={handleSyntHIRClick}> SyntHIR </button>

			<button onClick={handleSyntHIRWithDIPSClick}>
				SyntHIR with Open DIPS
			</button>
		</div>
	);
};

export default Landing;
