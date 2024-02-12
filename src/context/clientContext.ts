import { createContext, Dispatch, SetStateAction } from "react";
import Client from "fhirclient/lib/Client";

interface IClientContext {
	client: Client,
	clientSyntHIR: Client,
	setClient: Dispatch<SetStateAction<Client>>,
	setClientSyntHIR: Dispatch<SetStateAction<Client>>,
}

const clientContext = createContext<IClientContext>(undefined!);
export default clientContext;