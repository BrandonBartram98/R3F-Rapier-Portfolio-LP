import { MathUtils } from 'three'
import { useState, useRef } from 'react'
import { useCursor, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { InstancedRigidBodies, RigidBody, Attractor } from '@react-three/rapier'

export function Magnet(props) {
  const { nodes } = useGLTF('/Magnet.glb')
  // States
  const [hovered, hover] = useState(false)
  useCursor(hovered)

  // References
  const magnetMesh = useRef()
  const magnetMat = useRef()

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    if (props.isMagnetised) {
      magnetMesh.current.position.z += Math.cos(t * 20) * 0.0025
      magnetMesh.current.rotation.y += Math.cos(t * 20) * 0.0025
    }
  })

  return (
    <group
      {...props}
      ref={magnetMesh}
      position-x={3}
      rotation={[0, Math.PI / 2, 0]}
      scale={0.5}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      dispose={null}>
      <RigidBody type='kinematicPosition'>
        <mesh castShadow receiveShadow geometry={nodes.Circle002.geometry}>
          <meshStandardMaterial color={'white'} />
        </mesh>
        <mesh castShadow receiveShadow geometry={nodes.Circle002_1.geometry}>
          <meshStandardMaterial ref={magnetMat} roughness={1.0} color={props.isMagnetised ? 'red' : 'gray'} />
        </mesh>
      </RigidBody>
    </group>
  )
}

export default function InstancedMeshes({ count = 40, rand = MathUtils.randFloatSpread }) {
  const positions = Array.from({ length: count }, (_, i) => [rand(16), 14 + i / 2, rand(16)])
  const rotations = Array.from({ length: count }, () => [Math.random(), Math.random(), Math.random()])

  const popSound = new Audio('./popSound.wav')
  popSound.volume = 0.2

  const [isMagnetised, setIsMagnetised] = useState(false)

  const toggleMagnet = () => {
    setIsMagnetised((current) => !current)
    if (isMagnetised) {
      magnetToggleSoundOff.play()
    } else {
      magnetToggleSoundOn.play()
    }
  }

  const magnetToggleSoundOn = new Audio('./magnetToggleSoundOn.wav')
  const magnetToggleSoundOff = new Audio('./magnetToggleSoundOff.wav')
  magnetToggleSoundOn.volume = 0.3
  magnetToggleSoundOff.volume = 0.3

  const instancedApi = useRef(null)

  const handleClickInstance = (event) => {
    if (instancedApi.current) {
      popSound.play()
      instancedApi.current.at(event.instanceId).applyTorqueImpulse({ x: rand(-2) + 0.2, y: 0.05, z: rand(-1) + 0.2 })
    }
  }

  return (
    <>
      <Magnet isMagnetised={isMagnetised} onClick={toggleMagnet} />
      {isMagnetised ? <Attractor range={30} strength={0.1} position={[3, 2, 0]} /> : null}
      <InstancedRigidBodies
        ref={instancedApi}
        colliders={'hull'}
        positions={positions}
        rotations={rotations}
        restitution={0.5}
        angularDamping={0.5}
        mass={0.15}
        canSleep>
        <instancedMesh onClick={handleClickInstance} args={[undefined, undefined, count]} dispose={null} castShadow>
          <octahedronGeometry args={[0.3, 0, 0]} />
          <meshStandardMaterial transparent opacity={0.8} roughness={0} color={'hotpink'} />
        </instancedMesh>
      </InstancedRigidBodies>
    </>
  )
}

//useGLTF.preload('/Magnet.glb')
