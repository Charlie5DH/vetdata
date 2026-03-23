import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { currentUserQueryKey } from "@/api/auth";
import { api } from "@/lib/api";
import type {
  Clinic,
  ClinicCreatePayload,
  ClinicInvitation,
  ClinicInvitationCreatePayload,
  ClinicInvitationResendPayload,
  ClinicMember,
  ClinicUpdatePayload,
} from "@/types";

export const myClinicQueryKey = ["clinic", "me"] as const;
export const myClinicMembersQueryKey = ["clinic", "me", "members"] as const;
export const myClinicInvitationsQueryKey = [
  "clinic",
  "me",
  "invitations",
] as const;

export async function createClinic(payload: ClinicCreatePayload) {
  const { data } = await api.post<Clinic>("/clinics", payload);
  return data;
}

export async function fetchMyClinic() {
  const { data } = await api.get<Clinic>("/clinics/me");
  return data;
}

export async function updateMyClinic(payload: ClinicUpdatePayload) {
  const { data } = await api.patch<Clinic>("/clinics/me", payload);
  return data;
}

export async function fetchMyClinicMembers() {
  const { data } = await api.get<ClinicMember[]>("/clinics/me/members");
  return data;
}

export async function fetchMyClinicInvitations() {
  const { data } = await api.get<ClinicInvitation[]>("/clinics/me/invitations");
  return data;
}

export async function inviteClinicMember(
  payload: ClinicInvitationCreatePayload,
) {
  const { data } = await api.post<ClinicInvitation>(
    "/clinics/me/invitations",
    payload,
  );
  return data;
}

export async function resendClinicInvitation(
  invitationId: string,
  payload: ClinicInvitationResendPayload,
) {
  const { data } = await api.post<ClinicInvitation>(
    `/clinics/me/invitations/${invitationId}/resend`,
    payload,
  );
  return data;
}

export async function cancelClinicInvitation(invitationId: string) {
  await api.delete(`/clinics/me/invitations/${invitationId}`);
}

export async function removeClinicMember(membershipId: string) {
  await api.delete(`/clinics/me/members/${membershipId}`);
}

export function useCreateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClinic,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
        queryClient.invalidateQueries({ queryKey: myClinicQueryKey }),
        queryClient.invalidateQueries({ queryKey: myClinicMembersQueryKey }),
      ]);
    },
  });
}

export function useMyClinic(enabled = true) {
  return useQuery({
    queryKey: myClinicQueryKey,
    queryFn: fetchMyClinic,
    enabled,
  });
}

export function useUpdateMyClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyClinic,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
        queryClient.invalidateQueries({ queryKey: myClinicQueryKey }),
      ]);
    },
  });
}

export function useMyClinicMembers(enabled = true) {
  return useQuery({
    queryKey: myClinicMembersQueryKey,
    queryFn: fetchMyClinicMembers,
    enabled,
  });
}

export function useMyClinicInvitations(enabled = true) {
  return useQuery({
    queryKey: myClinicInvitationsQueryKey,
    queryFn: fetchMyClinicInvitations,
    enabled,
  });
}

export function useInviteClinicMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteClinicMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: myClinicInvitationsQueryKey,
      });
    },
  });
}

export function useResendClinicInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      payload,
    }: {
      invitationId: string;
      payload: ClinicInvitationResendPayload;
    }) => resendClinicInvitation(invitationId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: myClinicInvitationsQueryKey,
      });
    },
  });
}

export function useCancelClinicInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelClinicInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: myClinicInvitationsQueryKey,
      });
    },
  });
}

export function useRemoveClinicMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeClinicMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: myClinicMembersQueryKey,
      });
    },
  });
}
