import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

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
		<Container>
			<Button
				className="me-3"
				size="lg"
				onClick={handleSyntHIRClick}
				variant="primary"
			>
				SyntHIR
			</Button>
			<Button size="lg" onClick={handleSyntHIRWithDIPSClick} variant="primary">
				SyntHIR with Open DIPS
			</Button>
		</Container>
	);
};

export default Landing;
