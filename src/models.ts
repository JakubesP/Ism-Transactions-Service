import { camelizeKeys } from 'ism-common';

interface BaseEvent {
  Id: string;
  Version: number;
  Timestamp: number;
}

export type TransactionEventType = 'CONTRIBUTION' | 'COMPENSATION';

export const presentEvent = (event: BaseEvent): object => {
  return {
    ...camelizeKeys(event),
    version: undefined,
  };
};

export interface ClientInitiationEvent extends BaseEvent {
  Contribution: number;
  Compensation: number;
  Action: 'INITIATION';
}

export interface ClientContributionEvent extends BaseEvent {
  Amount: number;
  Action: 'CONTRIBUTION';
}

export interface ClientCompensationEvent extends BaseEvent {
  Amount: number;
  Action: 'COMPENSATION';
}

export interface SnapshotEvent extends BaseEvent {
  Contribution: number;
  Compensation: number;
  Action: 'SNAPSHOT';
}

export interface ClientDeactivationEvent extends BaseEvent {
  Action: 'DEACTIVATION';
}

export type ClientEvent =
  | ClientInitiationEvent
  | ClientContributionEvent
  | ClientCompensationEvent
  | ClientDeactivationEvent
  | SnapshotEvent;

export interface ClientState {
  Id: string;
  Contribution: number;
  Compensation: number;
}

export interface LastEvents {
  snapshot: SnapshotEvent;
  eventsAfterSnapshot: ClientEvent[];
}
