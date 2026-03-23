import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiMessageState, DisruptionType } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

function usePrincipal() {
  const { identity } = useInternetIdentity();
  return identity?.getPrincipal() ?? Principal.anonymous();
}

export function useTrip() {
  const { actor, isFetching } = useActor();
  const principal = usePrincipal();
  return useQuery({
    queryKey: ["trip", principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTrip(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFlightStatus(flightNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["flightStatus", flightNumber],
    queryFn: async () => {
      if (!actor || !flightNumber) return null;
      return actor.getFlightStatus(flightNumber);
    },
    enabled: !!actor && !isFetching && !!flightNumber,
  });
}

export function useQueueStatuses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["queueStatuses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQueueStatuses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBaggageItems() {
  const { actor, isFetching } = useActor();
  const principal = usePrincipal();
  return useQuery({
    queryKey: ["baggageItems", principal.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBaggageItems(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDigitalIdentityDocs() {
  const { actor, isFetching } = useActor();
  const principal = usePrincipal();
  return useQuery({
    queryKey: ["identityDocs", principal.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDigitalIdentityDocs(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTravelRightsInfo(disruptionType: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["travelRights", disruptionType],
    queryFn: async () => {
      if (!actor || !disruptionType) return null;
      return actor.getTravelRightsInfo(disruptionType);
    },
    enabled: !!actor && !isFetching && !!disruptionType,
  });
}

export function useAiMessages() {
  const { actor, isFetching } = useActor();
  const principal = usePrincipal();
  return useQuery({
    queryKey: ["aiMessages", principal.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAiMessages(principal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaveTime() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaveTime"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.computeLeaveHomeTime();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAiMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: AiMessageState) => {
      if (!actor) throw new Error("No actor");
      return actor.addAiMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiMessages"] });
    },
  });
}

export function useUpdateIdentityDoc() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      doc: Parameters<
        NonNullable<typeof actor>["addOrUpdateDigitalIdentityDoc"]
      >[0],
    ) => {
      if (!actor) throw new Error("No actor");
      return actor.addOrUpdateDigitalIdentityDoc(doc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identityDocs"] });
    },
  });
}

export function useSeedDemoData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedDemoData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export { usePrincipal };
export type { DisruptionType };
