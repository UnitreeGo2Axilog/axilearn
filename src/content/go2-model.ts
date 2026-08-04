/**
 * The robot the students drive: a Unitree Go2, drawn with boxes and capsules.
 *
 * The dimensions are NOT invented. Thigh and calf are both 0.213 m, the hips
 * sit at +-0.1934 fore/aft and +-0.0465 across, and every joint limit is
 * copied from unitree_robots/go2/go2.xml in the real research project. So the
 * physics a learner feels is a real Go2's physics; only the skin is simple.
 *
 * Simplified for three reasons, in order of how much they mattered:
 *
 *  1. MuJoCo's `MjModel.from_xml_string` takes the whole robot as a STRING.
 *     With primitives there are no mesh files at all -- no downloads, no
 *     virtual filesystem, nothing to host. The robot is 6 KB of this bundle.
 *  2. It reads at small sizes. A grey CAD mesh in a 400px panel is porridge;
 *     an orange foot on a teal leg is a foot.
 *  3. A learner can point at the thigh and the calf and say which is which,
 *     which is the whole point of the first lesson.
 */

/** Joint order in `qpos` after the 7 free-joint values, and in `ctrl`. */
export const JOINT_ORDER = [
  "FL_hip", "FL_thigh", "FL_calf",
  "FR_hip", "FR_thigh", "FR_calf",
  "RL_hip", "RL_thigh", "RL_calf",
  "RR_hip", "RR_thigh", "RR_calf",
] as const;

/** The names a learner types, mapped to the leg prefix the model uses. */
export const LEG_NAMES: Record<string, string> = {
  front_left: "FL",
  front_right: "FR",
  back_left: "RL",
  back_right: "RR",
};

/** Poses the lessons refer to by name. Angles in radians, per leg. */
export const POSES = {
  /** Folded on the floor, which is where every lesson starts. */
  lying: { hip: 0, thigh: 1.25, knee: -2.7 },
  /** Four feet down, trunk about 0.32 m up. The target of "stand up". */
  standing: { hip: 0, thigh: 0.9, knee: -1.8 },
} as const;

/** Trunk height that counts as standing, used by the Part 1 checker. */
export const STANDING_HEIGHT = 0.25;

export const GO2_MODEL_XML = `<mujoco model="go2-stylised">
  <compiler angle="radian" autolimits="true"/>
  <option timestep="0.002" gravity="0 0 -9.81" iterations="20"/>

  <default>
    <joint damping="0.6" armature="0.01" frictionloss="0.1"/>
    <geom friction="0.9 0.02 0.01" density="900" rgba="0.16 0.72 0.72 1"/>
    <position kp="80" forcerange="-24 24"/>
    <default class="hip"><joint axis="1 0 0" range="-1.0472 1.0472"/></default>
    <default class="thigh"><joint axis="0 1 0" range="-1.5708 3.4907"/></default>
    <default class="calf"><joint axis="0 1 0" range="-2.7227 -0.83776"/></default>
  </default>

  <worldbody>
    <light pos="0 0 3" dir="0 0 -1" diffuse="0.9 0.9 0.9"/>
    <geom name="floor" type="plane" size="20 20 0.1" rgba="0.92 0.94 0.96 1" friction="0.9"/>

    <body name="trunk" pos="0 0 0.34">
      <freejoint name="root"/>
      <geom name="trunk" type="box" size="0.19 0.06 0.045" rgba="0.13 0.15 0.22 1"/>
      <geom name="head" type="box" pos="0.21 0 0.01" size="0.03 0.035 0.025" rgba="0.98 0.55 0.15 1"/>

      <body name="FL_hip" pos="0.1934 0.0465 0">
        <joint name="FL_hip_joint" class="hip"/>
        <geom type="capsule" fromto="0 0 0 0 0.05 0" size="0.028" rgba="0.13 0.15 0.22 1"/>
        <body name="FL_thigh" pos="0 0.0955 0">
          <joint name="FL_thigh_joint" class="thigh"/>
          <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.022"/>
          <body name="FL_calf" pos="0 0 -0.213">
            <joint name="FL_calf_joint" class="calf"/>
            <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.017" rgba="0.10 0.55 0.60 1"/>
            <geom name="FL_foot" type="sphere" pos="0 0 -0.213" size="0.024" rgba="0.98 0.55 0.15 1"/>
          </body>
        </body>
      </body>

      <body name="FR_hip" pos="0.1934 -0.0465 0">
        <joint name="FR_hip_joint" class="hip"/>
        <geom type="capsule" fromto="0 0 0 0 -0.05 0" size="0.028" rgba="0.13 0.15 0.22 1"/>
        <body name="FR_thigh" pos="0 -0.0955 0">
          <joint name="FR_thigh_joint" class="thigh"/>
          <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.022"/>
          <body name="FR_calf" pos="0 0 -0.213">
            <joint name="FR_calf_joint" class="calf"/>
            <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.017" rgba="0.10 0.55 0.60 1"/>
            <geom name="FR_foot" type="sphere" pos="0 0 -0.213" size="0.024" rgba="0.98 0.55 0.15 1"/>
          </body>
        </body>
      </body>

      <body name="RL_hip" pos="-0.1934 0.0465 0">
        <joint name="RL_hip_joint" class="hip"/>
        <geom type="capsule" fromto="0 0 0 0 0.05 0" size="0.028" rgba="0.13 0.15 0.22 1"/>
        <body name="RL_thigh" pos="0 0.0955 0">
          <joint name="RL_thigh_joint" class="thigh"/>
          <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.022"/>
          <body name="RL_calf" pos="0 0 -0.213">
            <joint name="RL_calf_joint" class="calf"/>
            <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.017" rgba="0.10 0.55 0.60 1"/>
            <geom name="RL_foot" type="sphere" pos="0 0 -0.213" size="0.024" rgba="0.98 0.55 0.15 1"/>
          </body>
        </body>
      </body>

      <body name="RR_hip" pos="-0.1934 -0.0465 0">
        <joint name="RR_hip_joint" class="hip"/>
        <geom type="capsule" fromto="0 0 0 0 -0.05 0" size="0.028" rgba="0.13 0.15 0.22 1"/>
        <body name="RR_thigh" pos="0 -0.0955 0">
          <joint name="RR_thigh_joint" class="thigh"/>
          <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.022"/>
          <body name="RR_calf" pos="0 0 -0.213">
            <joint name="RR_calf_joint" class="calf"/>
            <geom type="capsule" fromto="0 0 0 0 0 -0.213" size="0.017" rgba="0.10 0.55 0.60 1"/>
            <geom name="RR_foot" type="sphere" pos="0 0 -0.213" size="0.024" rgba="0.98 0.55 0.15 1"/>
          </body>
        </body>
      </body>
    </body>
  </worldbody>

  <actuator>
    <position name="FL_hip" joint="FL_hip_joint"/>
    <position name="FL_thigh" joint="FL_thigh_joint"/>
    <position name="FL_calf" joint="FL_calf_joint"/>
    <position name="FR_hip" joint="FR_hip_joint"/>
    <position name="FR_thigh" joint="FR_thigh_joint"/>
    <position name="FR_calf" joint="FR_calf_joint"/>
    <position name="RL_hip" joint="RL_hip_joint"/>
    <position name="RL_thigh" joint="RL_thigh_joint"/>
    <position name="RL_calf" joint="RL_calf_joint"/>
    <position name="RR_hip" joint="RR_hip_joint"/>
    <position name="RR_thigh" joint="RR_thigh_joint"/>
    <position name="RR_calf" joint="RR_calf_joint"/>
  </actuator>
</mujoco>`;
