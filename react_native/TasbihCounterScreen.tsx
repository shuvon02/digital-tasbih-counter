import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  Vibration,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function TasbihCounterScreen() {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number | null>(null);
  const [targetInput, setTargetInput] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);

  // Modals
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Handle Full-Screen Tap
  const handleScreenTap = () => {
    // Crucial requirement #3: Validate Target Lock
    if (!isLocked || !target || target <= 0) {
      triggerWarning();
      return;
    }

    // Goal reached gate
    if (count >= target) {
      setShowCelebrationModal(true);
      return;
    }

    // Micro scale feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.08, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(25);
    }

    const nextCount = count + 1;
    setCount(nextCount);

    if (nextCount === target) {
      // Goal achieved!
      if (Platform.OS !== 'web') {
        Vibration.vibrate([40, 60, 80, 60, 160]);
      }
      setTimeout(() => {
        setShowCelebrationModal(true);
      }, 250);
    }
  };

  const triggerWarning = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate([40, 80, 40]);
    }
    setShowWarningModal(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSetTarget = (customValue?: number) => {
    const val = customValue !== undefined ? customValue : parseInt(targetInput, 10);
    if (!val || val <= 0) {
      return;
    }
    setTarget(val);
    setTargetInput(val.toString());
    setIsLocked(true);
    setShowWarningModal(false);
  };

  const handleReset = () => {
    setCount(0);
    setTarget(null);
    setTargetInput('');
    setIsLocked(false);
    setRound(1);
    setShowResetModal(false);
  };

  const progressPercentage = target ? Math.min(Math.round((count / target) * 100), 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#071512" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TASBIH PRO</Text>
          <Text style={styles.headerSubtitle}>
            {isLocked && target ? `Goal: ${target} (Round #${round})` : 'Goal Inactive'}
          </Text>
        </View>
      </View>

      {/* FULL SCREEN ACTIVE TAP ZONE */}
      <Pressable style={styles.tapZone} onPress={handleScreenTap}>
        <View style={styles.ringOuter}>
          <Text style={styles.counterLabel}>TOTAL COUNT</Text>
          <Animated.Text style={[styles.counterValue, { transform: [{ scale: scaleAnim }] }]}>
            {count}
          </Animated.Text>
          <Text style={styles.targetStatusText}>
            {target ? `TARGET: ${target}` : 'SET TARGET TO UNLOCK'}
          </Text>
          <View style={styles.percentBadge}>
            <Text style={styles.percentBadgeText}>{progressPercentage}%</Text>
          </View>
        </View>

        <Text style={styles.tapPrompt}>
          {isLocked ? 'Tap anywhere on screen' : '🔒 Set a target to unlock counting'}
        </Text>
      </Pressable>

      {/* DOCKED BOTTOM CONTROL CARD */}
      <View style={styles.controlCard}>
        {/* Quick Presets */}
        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>Quick:</Text>
          {[33, 99, 100, 313, 1000].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.presetChip, target === val && styles.presetChipActive]}
              onPress={() => handleSetTarget(val)}
            >
              <Text style={[styles.presetChipText, target === val && styles.presetChipTextActive]}>
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input & Action Buttons */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Target (e.g. 33)"
            placeholderTextColor="#386b5c"
            keyboardType="numeric"
            value={targetInput}
            onChangeText={setTargetInput}
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={() => handleSetTarget()}>
            <Text style={styles.btnPrimaryText}>Set Target</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowResetModal(true)}>
            <Text style={styles.btnSecondaryText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL 1: TARGET REQUIRED WARNING */}
      <Modal visible={showWarningModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.modalTitle}>⚠️ Target Required</Text>
            <Text style={styles.modalBody}>
              Please set a target goal first to begin counting! Locking in a goal keeps your session structured.
            </Text>
            <View style={styles.modalQuickRow}>
              {[33, 99, 100].map((v) => (
                <TouchableOpacity key={v} style={styles.modalChip} onPress={() => handleSetTarget(v)}>
                  <Text style={styles.modalChipText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btnPrimaryFull} onPress={() => setShowWarningModal(false)}>
              <Text style={styles.btnPrimaryText}>Enter Target Goal</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* MODAL 2: RESET CONFIRMATION */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Counter?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to clear your current count of {count}?
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnModalCancel} onPress={() => setShowResetModal(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalDanger} onPress={handleReset}>
                <Text style={styles.btnPrimaryText}>Yes, Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: GOAL REACHED CELEBRATION */}
      <Modal visible={showCelebrationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.celebrationBorder]}>
            <Text style={styles.celebrationBadge}>GOAL REACHED</Text>
            <Text style={styles.celebrationTitle}>Masha'Allah! 🎉</Text>
            <Text style={styles.modalBody}>
              You have completed {target} counts in Round #{round}!
            </Text>
            <TouchableOpacity
              style={styles.btnPrimaryFull}
              onPress={() => {
                setRound(round + 1);
                setCount(0);
                setShowCelebrationModal(false);
              }}
            >
              <Text style={styles.btnPrimaryText}>Start Round #{round + 1}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSecondaryFull, { marginTop: 8 }]}
              onPress={() => setShowCelebrationModal(false)}
            >
              <Text style={styles.btnSecondaryText}>Continue Beyond Target</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071512',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 211, 153, 0.15)',
    backgroundColor: '#0a1d18',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6ee7b7',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tapZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: width * 0.76,
    height: width * 0.76,
    borderRadius: (width * 0.76) / 2,
    borderWidth: 10,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 38, 33, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#386b5c',
    letterSpacing: 1.5,
  },
  counterValue: {
    fontSize: 74,
    fontWeight: '800',
    color: '#f0fdf4',
    marginVertical: 4,
  },
  targetStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a7f3d0',
  },
  percentBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  percentBadgeText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 12,
  },
  tapPrompt: {
    marginTop: 24,
    color: '#6ee7b7',
    fontSize: 14,
  },
  controlCard: {
    padding: 16,
    backgroundColor: '#0d221e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetLabel: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  presetChip: {
    backgroundColor: '#122d26',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  presetChipActive: {
    backgroundColor: '#10b981',
  },
  presetChipText: {
    color: '#f0fdf4',
    fontSize: 13,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#071512',
    fontWeight: '800',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#071512',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#f0fdf4',
    fontSize: 15,
    fontWeight: '600',
  },
  btnPrimary: {
    height: 46,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#071512',
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    height: 46,
    backgroundColor: '#122d26',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#f0fdf4',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0d221e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  celebrationBorder: {
    borderColor: '#fbbf24',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0fdf4',
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fbbf24',
    marginBottom: 8,
  },
  celebrationBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: '#a7f3d0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalQuickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modalChip: {
    backgroundColor: '#122d26',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalChipText: {
    color: '#f0fdf4',
    fontWeight: '700',
  },
  btnPrimaryFull: {
    width: '100%',
    height: 44,
    backgroundColor: '#10b981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryFull: {
    width: '100%',
    height: 44,
    backgroundColor: '#122d26',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnModalCancel: {
    flex: 1,
    height: 44,
    backgroundColor: '#122d26',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnModalDanger: {
    flex: 1,
    height: 44,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
