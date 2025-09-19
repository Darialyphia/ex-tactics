import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useGameState } from './useGameClient';
import type { SerializedEvent } from '@game/engine/src/utils/typed-emitter';
import type {
  UnitAfterMoveEvent,
  UnitAttackEvent,
  UnitTakeDamageEvent
} from '@game/engine/src/unit/unit.events';
import { config } from '@/utils/config';
import type { Container } from 'pixi.js';
import { useShaker } from '@/shared/composables/useShaker';
import { waitFor } from '@game/shared';
import { getDirectionFromDiff } from '@game/engine/src/board/board.utils';
import { useIsoWorld } from '@/iso/composables/useIsoWorld';

export const useUnitAnimations = (
  unit: Ref<UnitViewModel>,
  spriteContainer: Readonly<Ref<Container | undefined>>
) => {
  const state = useGameState();
  const isoWorld = useIsoWorld();

  const move = async (
    e: SerializedEvent<UnitAfterMoveEvent>,
    container: Ref<Container | undefined>
  ) => {
    const movedUnit = state.value.entities[e.unit] as UnitViewModel;
    if (!movedUnit.equals(unit.value)) return;

    const pos = movedUnit.position;

    for (const [index, step] of e.path.entries()) {
      const start = e.path[index - 1] ?? e.previousPosition;
      const end = step;
      const orientation = getDirectionFromDiff(start, end)!;
      unit.value.update({ orientation });
      const midPoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        z: (start.z + end.z) / 2 + config.UNIT_MOVEMENT_BOUNCE_HEIGHT
      };

      await gsap.to(pos, {
        motionPath: [start, midPoint, end],
        duration: config.UNIT_MOVEMENT_BOUNCE_DURATION,
        onUpdate: () => {
          const iso = isoWorld.toIso(pos);
          container.value?.position.set(iso.x, iso.y);
        }
      });
    }
  };

  const attack = async (e: SerializedEvent<UnitAttackEvent>) => {
    const attacker = state.value.entities[e.unit] as UnitViewModel;
    if (!attacker.equals(unit.value)) return;

    const start = unit.value.position;
    const end = e.target;
    const impactPoint = {
      x: start.x + (end.x - start.x) * 0.55,
      y: start.y + (end.y - start.y) * 0.55,
      z: start.z + (end.z - start.z) * 0.55
    };
    const anticipation = {
      x: start.x - (end.x - start.x) * 0.2,
      y: start.y - (end.y - start.y) * 0.2,
      z: start.z - (end.z - start.z) * 0.2
    };
    const tl = gsap.timeline();

    tl.to(unit.value.position, {
      ...anticipation,
      duration: 0.2
    })
      .to(unit.value.position, {
        ...impactPoint,
        duration: 0.1,
        ease: Power1.easeIn
      })

      .to(unit.value.position, {
        ...start,
        duration: 0.15
      });

    await tl.play();
  };

  const shaker = useShaker(spriteContainer);
  const takeDamage = async (e: SerializedEvent<UnitTakeDamageEvent>) => {
    const damagedUnit = state.value.entities[e.unit] as UnitViewModel;
    if (!damagedUnit.equals(unit.value)) return;

    if (!spriteContainer.value) return;

    const duration = 250;

    shaker.trigger({
      isBidirectional: false,
      amount: 10,
      delay: 35,
      count: Math.round(duration / 35)
    });

    await waitFor(duration);
  };

  return { move, attack, takeDamage };
};
