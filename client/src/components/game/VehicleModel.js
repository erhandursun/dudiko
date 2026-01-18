/*
  Sleek Convertible Car Model
*/
export default function VehicleModel({ color = "hotpink" }) {
    return (
        <group dispose={null} position={[0, 0, 0]}>
            {/* Chassis Body - Lower & Sleeker */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[1.4, 0.5, 3.2]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
            </mesh>

            {/* Side Fenders / Wheel Arches style */}
            <mesh position={[-0.7, 0.4, 0]} castShadow>
                <boxGeometry args={[0.2, 0.4, 2.8]} />
                <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[0.7, 0.4, 0]} castShadow>
                <boxGeometry args={[0.2, 0.4, 2.8]} />
                <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>

            {/* Interior Seat */}
            <mesh position={[0, 0.6, -0.4]} castShadow>
                <boxGeometry args={[1.1, 0.4, 1.2]} />
                <meshStandardMaterial color="#424242" />
            </mesh>

            {/* Dashboard */}
            <mesh position={[0, 0.7, 0.4]} castShadow>
                <boxGeometry args={[1.0, 0.3, 0.3]} />
                <meshStandardMaterial color="#212121" />
            </mesh>

            {/* Windshield - Angled */}
            <mesh position={[0, 0.9, 0.5]} rotation={[0.4, 0, 0]} castShadow>
                <boxGeometry args={[1.3, 0.5, 0.05]} />
                <meshStandardMaterial color="#a7ffeb" transparent opacity={0.5} roughness={0.1} metalness={0.9} />
            </mesh>

            {/* Wheels - Wide & Sporty */}
            {[
                [-0.8, 0.3, 1.1], [0.8, 0.3, 1.1], // Front
                [-0.8, 0.3, -1.1], [0.8, 0.3, -1.1] // Rear
            ].map((pos, i) => (
                <group position={pos} rotation={[0, 0, Math.PI / 2]} key={i}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.35, 0.35, 0.3, 24]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Rims */}
                    <mesh position={[0, 0.16, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
                        <meshStandardMaterial color="#eee" metalness={0.8} />
                    </mesh>
                </group>
            ))}

            {/* Headlights */}
            <mesh position={[-0.5, 0.5, 1.55]}>
                <sphereGeometry args={[0.15]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.5, 0.5, 1.55]}>
                <sphereGeometry args={[0.15]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>

            {/* Taillights */}
            <mesh position={[-0.5, 0.5, -1.55]}>
                <boxGeometry args={[0.3, 0.15, 0.1]} />
                <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0.5, 0.5, -1.55]}>
                <boxGeometry args={[0.3, 0.15, 0.1]} />
                <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={1} />
            </mesh>
        </group>
    );
}
