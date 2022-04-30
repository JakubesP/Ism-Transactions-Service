import {
  ClientCompensationEvent,
  ClientContributionEvent,
  ClientState,
  LastEvents,
} from '../../models';

/**
 * Builds the current client state using snapshot and following events.
 */
export const retrieveClientState = (lastEvents: LastEvents): ClientState => {
  const { snapshot, eventsAfterSnapshot } = { ...lastEvents };

  const state = {
    Id: snapshot.Id,
    Contribution: snapshot.Contribution,
    Compensation: snapshot.Compensation,
  };

  for (const event of eventsAfterSnapshot) {
    switch (event.Action) {
      case 'CONTRIBUTION': {
        const contributionEvent = event as ClientContributionEvent;
        state.Contribution += contributionEvent.Amount;
        break;
      }

      case 'COMPENSATION': {
        const compensationEvent = event as ClientCompensationEvent;
        state.Compensation += compensationEvent.Amount;
        break;
      }
    }
  }

  return state;
};
