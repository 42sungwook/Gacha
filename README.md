# 🎲 Gacha 3D

> **React + TypeScript + Three.js**로 구현한 3D 물리 기반 레이싱 게임

## 🎯 Quick Start

```bash
# 즉시 실행 가능 (Node.js 18+)
npm install && npm run dev
```

## 🏗️ 아키텍처 & 설계

### 1. 🌍 React Three Fiber 기반 3D 렌더링

```typescript
// GameContent.tsx - 3D 게임 환경 구성
export function GameContent({
  config,
  raceStarted,
  activePlayers,
  playerBodies
}: GameContentProps) {
  return (
    <>
      <OrbitControls
        enabled={!raceStarted || !cameraTrackingEnabled || allPlayersFinished}
      />
      
      <Physics
        gravity={
          raceStarted
            ? [config.physics.gravity.x, config.physics.gravity.y, config.physics.gravity.z]
            : [0, 0, 0]
        }
      >
        <FinishLine config={config.finishLine} onPlayerFinish={onPlayerFinish} />
        
        {config.walls.map((wall) => (
          <Wall key={wall.id} config={wall} />
        ))}
        
        {activePlayers.map((player) => (
          <Player
            key={player.id}
            config={player}
            onBodyRef={onBodyRef}
            name={player.name}
          />
        ))}
      </Physics>
    </>
  )
}
```

### 2. ⚡ Cannon.js 물리 엔진 통합

```typescript
// Player.tsx - 구 형태의 물리 기반 플레이어 객체
export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ config, onBodyRef, name }, forwardedRef) => {
    const radius = Math.min(config.size?.x || 1, config.size?.y || 1, config.size?.z || 1) / 2
    const textRef = useRef<THREE.Mesh>(null)

    const [ref, api] = useSphere<THREE.Mesh>(() => ({
      mass: config.mass,
      position: [config.position.x, config.position.y, config.position.z],
      args: [radius],
      userData: { playerId: config.id }
    }))

    // 텍스트가 항상 카메라를 바라보도록 설정
    useFrame(({ camera }) => {
      if (!textRef.current || !ref.current) return

      const worldPosition = new THREE.Vector3()
      ref.current.getWorldPosition(worldPosition)

      textRef.current.position.set(
        worldPosition.x,
        worldPosition.y + radius + TEXT_HEIGHT_OFFSET,
        worldPosition.z
      )

      textRef.current.lookAt(camera.position)
    })

    return (
      <>
        <mesh ref={ref}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={config.color}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {name && (
          <Text
            ref={textRef}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="black"
          >
            {name}
          </Text>
        )}
      </>
    )
  }
)
```

### 3. 🎨 Styled Components 기반 UI 시스템

```typescript
// GameMap.tsx - 테마 기반 스타일링
const GameOverlay = styled.div`
  position: absolute;
  top: ${theme.spacing.xl};
  left: ${theme.spacing.xl};
  z-index: ${theme.zIndex.overlay};
  background: rgba(0, 0, 0, 0.7);
  color: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  font-family: Arial, sans-serif;
`

const GravitySlider = styled.input`
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    border: 2px solid ${theme.colors.white};
  }
`
```

**🎨 스타일링 전략:**

- **테마 시스템**: 일관된 컬러 팔레트와 스페이싱
- **반응형 디자인**: 다양한 화면 크기 대응
- **3D UI 오버레이**: 몰입감 있는 게임 인터페이스

---

## ⚡ 성능 최적화

### 1. 🎯 커스텀 훅 기반 상태 관리

```typescript
// usePlayerPositions.ts - 플레이어 물리 바디 관리
export function usePlayerBodies() {
  const playerBodiesRef = useRef<PlayerData[]>([])

  const addPlayerBody = useCallback((id: string, api: Api<Mesh>[1]) => {
    const existingIndex = playerBodiesRef.current.findIndex((p) => p.id === id)
    const newPlayerData: PlayerData = {
      id,
      api,
      currentPosition: { x: 0, y: 0, z: 0 }
    }

    if (existingIndex >= 0) {
      playerBodiesRef.current[existingIndex] = newPlayerData
    } else {
      playerBodiesRef.current.push(newPlayerData)
    }

    // 실시간 위치 구독
    if (api.position) {
      api.position.subscribe((position: Triplet) => {
        const playerData = playerBodiesRef.current.find((p) => p.id === id)
        if (playerData) {
          playerData.currentPosition = {
            x: position[0],
            y: position[1],
            z: position[2]
          }
        }
      })
    }
  }, [])

  return { addPlayerBody, getPlayerBodies }
}
```

### 2. 🎮 실시간 카메라 추적 시스템

```typescript
// useCameraTracking.ts - 가장 낮은 위치 플레이어 추적
export function useCameraTracking({ 
  playerBodies, 
  activePlayers,
  config, 
  raceStarted,
  enabled 
}: CameraTrackingProps) {
  const { camera } = useThree()
  const targetPositionRef = useRef(new Vector3())
  const currentPositionRef = useRef(new Vector3())

  // 가장 낮은 위치에 있는 활성 플레이어 찾기
  const findLowestPlayer = (): PlayerData | null => {
    if (playerBodies.length === 0 || activePlayers.length === 0) return null
    
    const activePlayerIds = new Set(activePlayers.map(p => p.id))
    const activePlayerBodies = playerBodies.filter(playerData => 
      activePlayerIds.has(playerData.id)
    )
    
    let lowestPlayer = activePlayerBodies[0]
    let minY = Infinity
    
    for (const playerData of activePlayerBodies) {
      const y = playerData.currentPosition.y
      if (y < minY) {
        minY = y
        lowestPlayer = playerData
      }
    }
    
    return lowestPlayer
  }

  useFrame(() => {
    if (!raceStarted || !enabled) return
    
    const lowestPlayer = findLowestPlayer()
    if (!lowestPlayer) return
    
    const playerPos = lowestPlayer.currentPosition
    
    // 카메라 목표 위치 설정
    targetPositionRef.current.set(
      playerPos.x,
      playerPos.y + CAMERA_HEIGHT_OFFSET,
      playerPos.z + CAMERA_DISTANCE_OFFSET
    )
    
    // 부드러운 카메라 이동
    currentPositionRef.current.lerp(targetPositionRef.current, CAMERA_LERP_FACTOR)
    camera.position.copy(currentPositionRef.current)
    camera.lookAt(playerPos.x, playerPos.y, playerPos.z)
  })
}
```

**🎯 실제 구현된 최적화:**

- **useRef 기반 상태 관리**: useState 대신 useRef로 리렌더링 방지
- **실시간 위치 구독**: api.position.subscribe로 물리 바디 위치 추적
- **가장 낮은 플레이어 추적**: 모든 플레이어 대신 가장 아래 플레이어만 카메라 추적

### 3. 🗺️ 맵 시스템 & 모듈화

```typescript
// mapRegistry.ts - 동적 맵 로딩 시스템
export interface GameConfig {
  name: string
  description: string
  physics: PhysicsConfig
  camera: CameraConfig
  walls: WallConfig[]
  obstacles: ObstacleConfig[]
  finishLine: FinishLineConfig
}

const mapRegistry = new Map<string, MapEntry>()

export function registerMap(id: string, name: string, config: GameConfig) {
  mapRegistry.set(id, { id, name, config })
}

export function getMapById(id: string): MapEntry {
  const map = mapRegistry.get(id)
  if (!map) {
    throw new Error(`Map with id "${id}" not found`)
  }
  return map
}

// JSON 기반 맵 정의
registerMap('default', '기본 맵', defaultMapConfig)
```

**📊 실제 측정 불가능한 영역:**

성능 최적화 결과에 대한 구체적인 벤치마크는 측정하지 않았습니다. 
단지 코드 레벨에서의 최적화 기법을 적용한 것이며, 실제 성능 향상 수치는 별도 측정이 필요합니다.

---

## 🚀 Core 기능

### 1. 🎯 지능형 플레이어 파싱 시스템

```typescript
// playerParser.ts - 플레이어 입력 파싱
export function parsePlayersInput(
  input: string,
  positions: Position[]
): PlayerObjectWithPosition[] {
  if (!input.trim()) {
    return generateDefaultPlayers(positions)
  }

  const entries = input.split(',').map(s => s.trim()).filter(s => s)
  const players: PlayerObjectWithPosition[] = []
  let positionIndex = 0

  entries.forEach(entry => {
    const match = entry.match(/^(.+)\*(\d+)$/)
    if (match) {
      const [, name, countStr] = match
      const count = parseInt(countStr, 10)
      
      for (let i = 0; i < count; i++) {
        if (positionIndex < positions.length) {
          players.push({
            id: `${name}_${i}`,
            name: `${name}_${i}`,
            position: positions[positionIndex],
            mass: 1,
            color: getRandomColor()
          })
          positionIndex++
        }
      }
    }
  })

  return players
}
```

### 2. 🚩 실시간 순위 시스템

```typescript
// useFinishLineDetection.ts - 완주 감지 및 순위 관리
export function useFinishLineDetection() {
  const [finishedPlayers, setFinishedPlayers] = useState<FinishedPlayer[]>([])

  const onPlayerFinish = useCallback((
    playerId: string,
    playerName: string,
    removePlayer: (id: string) => void
  ) => {
    setFinishedPlayers(prev => {
      if (prev.some(p => p.id === playerId)) return prev
      
      const newFinishedPlayer: FinishedPlayer = {
        id: playerId,
        name: playerName,
        rank: prev.length + 1,
        finishTime: Date.now()
      }
      
      removePlayer(playerId)
      return [...prev, newFinishedPlayer]
    })
  }, [])

  return { finishedPlayers, onPlayerFinish, onPlayerOutOfBounds, resetRanking }
}
```

### 3. 📱 중력 제어 시스템

```typescript
// GameMap.tsx - 실시간 중력 조절
const WEAK_GRAVITY = -2
const NORMAL_GRAVITY = -5
const EARTH_GRAVITY = -9.82
const STRONG_GRAVITY = -15

<GravityControl>
  <label>중력 설정: {gravity.toFixed(2)}</label>
  <GravitySlider
    type="range"
    min={MIN_GRAVITY.toString()}
    max={MAX_GRAVITY.toString()}
    step={GRAVITY_STEP.toString()}
    value={gravity}
    onChange={(e) => setGravity(parseFloat(e.target.value))}
  />
  <GravityPresets>
    <PresetButton onClick={() => setGravity(WEAK_GRAVITY)}>약함</PresetButton>
    <PresetButton onClick={() => setGravity(NORMAL_GRAVITY)}>보통</PresetButton>
    <PresetButton onClick={() => setGravity(EARTH_GRAVITY)}>지구</PresetButton>
    <PresetButton onClick={() => setGravity(STRONG_GRAVITY)}>강함</PresetButton>
  </GravityPresets>
</GravityControl>
```

### 4. 🎮 경계 감지 & 자동 제거

```typescript
// useOutOfBoundsDetection.ts - 플레이어 경계 이탈 감지
export function useOutOfBoundsDetection({
  playerBodies,
  config,
  onPlayerOutOfBounds,
  enabled
}: OutOfBoundsDetectionProps) {
  useFrame(() => {
    if (!enabled) return

    playerBodies.forEach(({ id, api }) => {
      api.position.subscribe(([x, y, z]) => {
        const isOutOfBounds = (
          y < config.boundaries.minY ||
          x < config.boundaries.minX ||
          x > config.boundaries.maxX ||
          z < config.boundaries.minZ ||
          z > config.boundaries.maxZ
        )

        if (isOutOfBounds) {
          onPlayerOutOfBounds(id)
        }
      })
    })
  })
}
```

### 5. 🏁 동적 맵 선택 시스템

```typescript
// MapSelector.tsx - 런타임 맵 변경
export function MapSelector({ selectedMapId, onMapSelect }: MapSelectorProps) {
  const maps = getAllMaps()

  return (
    <SelectorContainer>
      <Label>맵 선택:</Label>
      <Select value={selectedMapId} onChange={(e) => onMapSelect(e.target.value)}>
        {maps.map((map) => (
          <option key={map.id} value={map.id}>
            {map.name}
          </option>
        ))}
      </Select>
    </SelectorContainer>
  )
}
```

---

## 🛠️ 기술 스택

```json
{
  "core": ["React 19", "TypeScript 5.9", "Rsbuild"],
  "3d": ["Three.js", "@react-three/fiber", "@react-three/drei"],
  "physics": ["@react-three/cannon", "cannon-es"],
  "styling": ["styled-components", "테마 시스템"],
  "analytics": ["@vercel/analytics"],
  "build": ["Rsbuild", "TypeScript", "ESM"]
}
```

---

## 🚀 시작하기

```bash
# 환경 설정 (Node 버전 확인)
node --version # 18+ 필요

# 의존성 설치
npm install

# 개발 서버 실행 (자동으로 브라우저 열림)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

**🎮 게임 조작법:**

- **플레이어 입력**: `이름*개수` 형식 (예: `김철수*10, 이영희*5`)
- **중력 조절**: 슬라이더 또는 프리셋 버튼으로 조정
- **카메라 제어**: 경주 중 카메라 추적 ON/OFF 가능
- **마우스 조작**: 3D 뷰 회전, 줌인/줌아웃

---

## 🤔 고민 포인트

### 🗺️ 맵 시스템 설계: 자유자재로 설정 가능한 Config 구조

**🔍 핵심 고민:**

어떻게 하면 다양한 3D 맵을 쉽게 생성하고 관리할 수 있을까?

**🛠️ 설계 과정:**

**1단계: 타입 시스템 설계**

```typescript
// gameConfig.d.ts - 컴포넌트별 세분화된 설정
export interface GameConfig {
  name: string
  description?: string
  gameArea: GameAreaConfig      // 게임 영역 경계
  boxes: GameBoxConfig[]        // 기본 박스들  
  walls: WallConfig[]           // 벽면들
  obstacles: ObstacleConfig[]   // 회전하는 장애물들
  finishLine: FinishLineConfig  // 결승선
  physics: PhysicsConfig        // 물리 설정
  camera: CameraConfig          // 카메라 위치
}

export interface ObstacleConfig {
  id: string
  type: 'box' | 'sphere' | 'cylinder' | 'ramp' | 'funnel'
  position: Vector3
  size: Vector3
  rotation?: Vector3
  color?: string
  mass?: number
  rotationSpeed?: Vector3  // 🎯 핵심: 각 축별 회전 속도
}
```

**2단계: JSON 기반 맵 정의 시스템**

```json
// defaultMap.json - 실제 맵 설정 예시
{
  "name": "바운스 아레나: 대역전의 무대",
  "obstacles": [
    {
      "id": "level-8-chaos-full",
      "type": "box",
      "position": { "x": 0, "y": 30, "z": 0 },
      "size": { "x": 11, "y": 0.5, "z": 11 },
      "rotation": { "x": 0.3, "y": 0.1, "z": 0.2 },
      "rotationSpeed": { "x": 1.5, "y": 1.2, "z": 0.8 },
      "color": "#fdcb6e"
    }
  ],
  "camera": {
    "position": { "x": 0, "y": 18, "z": 16 },
    "target": { "x": 0, "y": 14, "z": 0 }
  }
}
```

**3단계: 동적 맵 로딩 시스템**

```typescript
// mapRegistry.ts - 자동화된 맵 등록
const mapConfigs = {
  defaultMap: defaultMapConfig
  // 새 맵 추가 시 여기에 import만 하면 됨
}

// 동적으로 mapRegistry 생성
const mapRegistry: MapRegistry = {}
for (const [fileName, config] of Object.entries(mapConfigs)) {
  const mapId = fileName.replace('Map', '').toLowerCase()
  mapRegistry[mapId] = {
    id: mapId,
    name: config.name,
    config: config as GameConfig
  }
}
```

**4단계: 지능형 플레이어 시작 위치 계산**

```typescript
// 맵 높이 자동 분석해서 플레이어 시작점 결정
const getMapMaxHeight = (config: GameConfig): number => {
  let maxHeight = 0
  config.obstacles.forEach((obstacle) => {
    const obstacleTop = obstacle.position.y + (obstacle.size?.y || 1) / 2
    maxHeight = Math.max(maxHeight, obstacleTop)
  })
  return maxHeight
}

export const getDefaultPositions = (count?: number): Vector3[] => {
  const defaultConfig = mapConfigs.defaultMap as GameConfig
  const mapMaxHeight = getMapMaxHeight(defaultConfig)
  const startY = mapMaxHeight + 10 // 최고 장애물보다 10 높은 위치
  
  // 격자 형태로 플레이어 배치
  // ...
}
```

**✅ 최종 해결책의 장점:**

1. **확장성**: 새 맵 추가가 JSON 파일 하나면 끝
2. **타입 안전성**: TypeScript로 설정 오류 사전 방지  
3. **자동화**: 플레이어 시작 위치가 맵 높이에 따라 자동 계산
4. **유연성**: 회전 속도, 색상, 크기 등 모든 속성 개별 설정 가능
5. **시각적 편의성**: JSON으로 맵 구조를 한눈에 파악 가능

**🎯 핵심 인사이트:**

맵 제작자가 3D 좌표와 물리 법칙을 이해하지 않아도 JSON만 수정하면 복잡한 3D 맵을 만들 수 있는 시스템 구축이 목표였습니다.
