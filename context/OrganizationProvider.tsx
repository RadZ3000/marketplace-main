import { createContext, useContext, useReducer, FC } from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { Organization } from "context/config"

export const OrganizationContext = createContext<{
  organization: Organization | null
}>({
  organization: null,
})

export const OrganizationProvider: FC<{
  organization: Organization,
  children: ReactElement,
}> = ({ organization, children }) => {

  return (
    <OrganizationContext.Provider value={{ organization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  return useContext(OrganizationContext);
}
