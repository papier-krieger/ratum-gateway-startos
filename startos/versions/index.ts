import { VersionGraph } from '@start9labs/start-sdk'
import { v_1_0_0_0 } from './v1_0_0_0'
import { v_1_1_0_0 } from './v1_1_0_0'
import { v_1_1_0_1 } from './v1_1_0_1'

export const versionGraph = VersionGraph.of({
  current: v_1_1_0_1,
  other: [v_1_0_0_0, v_1_1_0_0],
})
