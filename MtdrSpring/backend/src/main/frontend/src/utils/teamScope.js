export const DEFAULT_TEAM_ID = 1

const normalizeTeamId = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TEAM_ID
}

export const resolveTeamId = (value) => normalizeTeamId(value)

export const resolveTeamIdFromUser = (user) =>
	normalizeTeamId(
		user?.teamId ?? user?.teamID ?? user?.team?.teamId ?? user?.team?.id ?? DEFAULT_TEAM_ID,
	)