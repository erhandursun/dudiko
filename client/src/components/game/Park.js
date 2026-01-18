import { RigidBody } from '@react-three/rapier';

export default function Park({ position = [0, 0, 0] }) {
    return (
        <group position={position}>
            {/* Park Grass (Raised slightly above asphalt) */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 0.05, 0]} receiveShadow>
                    <boxGeometry args={[20, 0.1, 20]} />
                    <meshStandardMaterial color="#4caf50" />
                </mesh>
            </RigidBody>

            {/* Slide Structure */}
            <group position={[0, 0, 0]}>
                {/* Slide Ramp */}
                <RigidBody type="fixed" colliders="hull">
                    <mesh position={[0, 1.5, 3]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2, 0.1, 7]} />
                        <meshStandardMaterial color="#FFC107" />
                    </mesh>
                </RigidBody>

                {/* Top Platform */}
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[0, 3, -1.5]} castShadow receiveShadow>
                        <boxGeometry args={[2, 0.2, 2]} />
                        <meshStandardMaterial color="#F44336" />
                    </mesh>
                </RigidBody>

                {/* Ladder/Stairs (Steep ramp for now) */}
                <RigidBody type="fixed" colliders="hull">
                    <mesh position={[0, 1.5, -4]} rotation={[-Math.PI / 3, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[2, 0.1, 4]} />
                        <meshStandardMaterial color="#2196F3" />
                    </mesh>
                </RigidBody>

                {/* Supports */}
                <mesh position={[0, 1.5, -1.5]} castShadow>
                    <boxGeometry args={[1.8, 3, 1.8]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
            </group>
        </group>
    );
}
