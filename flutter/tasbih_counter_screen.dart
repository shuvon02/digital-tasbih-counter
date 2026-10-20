import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class TasbihCounterScreen extends StatefulWidget {
  const TasbihCounterScreen({super.key});

  @override
  State<TasbihCounterScreen> createState() => _TasbihCounterScreenState();
}

class _TasbihCounterScreenState extends State<TasbihCounterScreen>
    with SingleTickerProviderStateMixin {
  int _count = 0;
  int? _target;
  bool _isLocked = false;
  int _round = 1;
  final TextEditingController _targetController = TextEditingController();

  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _scaleController.dispose();
    _targetController.dispose();
    super.dispose();
  }

  void _handleScreenTap() {
    // Crucial Requirement #3: Check target lock
    if (!_isLocked || _target == null || _target! <= 0) {
      HapticFeedback.heavyImpact();
      _showTargetRequiredDialog();
      return;
    }

    if (_count >= _target!) {
      _showCelebrationDialog();
      return;
    }

    // Normal tap increment
    HapticFeedback.lightImpact();
    _scaleController.forward().then((_) => _scaleController.reverse());

    setState(() {
      _count++;
    });

    if (_count == _target!) {
      HapticFeedback.vibrate();
      Future.delayed(const Duration(milliseconds: 200), () {
        _showCelebrationDialog();
      });
    }
  }

  void _setTarget([int? quickVal]) {
    final val = quickVal ?? int.tryParse(_targetController.text.trim());
    if (val == null || val <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid positive target goal!'),
          backgroundColor: Colors.amber,
        ),
      );
      return;
    }

    setState(() {
      _target = val;
      _targetController.text = val.toString();
      _isLocked = true;
    });

    FocusScope.of(context).unfocus();
  }

  void _resetCounter() {
    setState(() {
      _count = 0;
      _target = null;
      _isLocked = false;
      _round = 1;
      _targetController.clear();
    });
  }

  void _showTargetRequiredDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0D221E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('⚠️ Target Required', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Please set a target goal first to begin counting! Locking in a goal keeps your session structured.',
          style: TextStyle(color: Color(0xFFA7F3D0)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Set Target Now', style: TextStyle(color: Color(0xFF10B981))),
          ),
        ],
      ),
    );
  }

  void _showResetConfirmation() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0D221E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Reset Counter?', style: TextStyle(color: Colors.white)),
        content: Text(
          'Are you sure you want to clear your current count of $_count?',
          style: const TextStyle(color: Color(0xFFA7F3D0)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              Navigator.pop(ctx);
              _resetCounter();
            },
            child: const Text('Yes, Reset'),
          ),
        ],
      ),
    );
  }

  void _showCelebrationDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0D221E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFFFBBF24), width: 1.5),
        ),
        title: const Text(
          'Masha\'Allah! Goal Reached 🎉',
          textAlign: TextAlign.center,
          style: TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold),
        ),
        content: Text(
          'You completed $_target counts in Round #$_round!',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white70),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: const Color(0xFF071512),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _round++;
                _count = 0;
              });
            },
            child: Text('Start Round #${_round + 1}'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Continue Counting', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double progress = (_target != null && _target! > 0)
        ? math.min(_count / _target!, 1.0)
        : 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFF071512),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D221E),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'TASBIH PRO',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF10B981),
                letterSpacing: 1.2,
              ),
            ),
            Text(
              _isLocked ? 'Goal: $_target (Round #$_round)' : 'Goal Inactive',
              style: const TextStyle(fontSize: 11, color: Color(0xFF6EE7B7)),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // FULL SCREEN ACTIVE TAP ZONE
            Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _handleScreenTap,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Circular Ring Progress
                      SizedBox(
                        width: 260,
                        height: 260,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              width: 250,
                              height: 250,
                              child: CircularProgressIndicator(
                                value: progress,
                                strokeWidth: 14,
                                backgroundColor: const Color(0xFF122D26),
                                valueColor: const AlwaysStoppedAnimation(Color(0xFF10B981)),
                              ),
                            ),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  'TOTAL COUNT',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF386B5C),
                                    letterSpacing: 1.5,
                                  ),
                                ),
                                ScaleTransition(
                                  scale: _scaleAnimation,
                                  child: Text(
                                    '$_count',
                                    style: const TextStyle(
                                      fontSize: 68,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                                Text(
                                  _target != null ? 'TARGET: $_target' : 'NOT SET',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFFA7F3D0),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _isLocked
                            ? 'Tap anywhere on the screen'
                            : '🔒 Set target goal to unlock',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF6EE7B7)),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // DOCKED BOTTOM CONTROL CARD
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: const BoxDecoration(
                color: Color(0xFF0D221E),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Quick Preset Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [33, 99, 100, 313, 1000].map((val) {
                        final isSelected = _target == val;
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ActionChip(
                            label: Text('$val'),
                            backgroundColor: isSelected
                                ? const Color(0xFF10B981)
                                : const Color(0xFF122D26),
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.black : Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                            onPressed: () => _setTarget(val),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Input & Buttons
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _targetController,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'Target Goal',
                            hintStyle: const TextStyle(color: Color(0xFF386B5C)),
                            filled: true,
                            fillColor: const Color(0xFF071512),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: const Color(0xFF071512),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () => _setTarget(),
                        child: const Text('Set'),
                      ),
                      const SizedBox(width: 6),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white70,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _showResetConfirmation,
                        child: const Text('Reset'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
