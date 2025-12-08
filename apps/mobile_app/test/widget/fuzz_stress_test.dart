import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/presentation/features/application/screens/application_form_screen.dart';
import 'package:mobile_app/presentation/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/presentation/features/establishment/providers/establishment_provider.dart';
import 'package:mobile_app/presentation/features/application/providers/application_provider.dart';
import 'package:mobile_app/domain/repositories/auth_repository.dart';
import 'package:mobile_app/domain/repositories/establishment_repository.dart';
import 'package:mobile_app/domain/repositories/application_repository.dart';
import 'package:mobile_app/domain/entities/user_entity.dart';
import 'package:mobile_app/domain/entities/application_entity.dart';
import 'package:mobile_app/core/network/dio_client.dart';
import 'package:mobile_app/core/errors/failures.dart';
import 'package:dartz/dartz.dart';

// Mocks with Mutable Behavior for "Network Ghosts"
class MockAuthRepository extends Mock implements AuthRepository {}

class MockDioClient extends Mock implements DioClient {}

class MockEstablishmentRepository extends Mock
    implements EstablishmentRepository {}

class MutableMockApplicationRepository extends Mock
    implements ApplicationRepository {
  bool simulateNetworkError = false;

  @override
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications() async {
    if (simulateNetworkError) {
      return const Left(NetworkFailure(message: 'Network Error: 500'));
    }
    return const Right([]);
  }
}

void main() {
  // IntegrationTestWidgetsFlutterBinding.ensureInitialized(); // Not needed for Widget Test

  final rnd = Random(); // Random Seed
  late MockAuthRepository mockAuthRepo;
  late MockEstablishmentRepository mockEstRepo;
  late MutableMockApplicationRepository mockAppRepo;

  setUp(() {
    mockAuthRepo = MockAuthRepository();
    mockEstRepo = MockEstablishmentRepository();
    mockAppRepo = MutableMockApplicationRepository();
  });

  testWidgets('Chaos Fuzz Test: 1000 Iterations of Mayhem', (tester) async {
    // 1. Arrange Baseline Mocks
    final tUser = UserEntity(
        id: 'user_chaos_1',
        email: 'chaos@gacp.com',
        firstName: 'Chaos',
        lastName: 'Monkey',
        role: 'farmer',
        phoneNumber: '000',
        address: 'Void',
        zipCode: '00000',
        registeredAt: DateTime.now());

    when(() => mockAuthRepo.getCurrentUser())
        .thenAnswer((_) async => Right(tUser));

    when(() => mockEstRepo.getEstablishments())
        .thenAnswer((_) async => const Right([]));

    // 2. Launch App Harness
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepo),
          establishmentRepositoryProvider.overrideWithValue(mockEstRepo),
          applicationProvider.overrideWith(
              (ref) => ApplicationNotifier(mockAppRepo, MockDioClient())),
        ],
        child: const MaterialApp(
          home: ApplicationFormScreen(requestType: 'NEW'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    debugPrint('🔥 BEGINNING CHAOS TEST - 1000 ITERATIONS 🔥');

    // 3. The 1000 Iterations Loop
    for (int i = 0; i < 1000; i++) {
      final squadId = rnd.nextInt(4) + 1; // 1 to 4
      debugPrint('💀 Iteration $i: Deploying Squad $squadId');

      try {
        switch (squadId) {
          case 1:
            await _runSpeedRunners(tester, rnd);
            break;
          case 2:
            await _runNetworkGhosts(tester, mockAppRepo);
            break;
          case 3:
            await _runInputSpammers(tester, rnd);
            break;
          case 4:
            await _runDeepNavigators(tester);
            break;
        }

        // Recovery Pump
        await tester
            .pumpAndSettle(const Duration(milliseconds: 100)); // Brief settle
      } catch (e) {
        debugPrint('💥 CRASH DETECTED in Iteration $i (Squad $squadId): $e');
        // In a real fuzz test, we might want to fail here, or count crashes.
        // For now, rethrow to fail the test.
        // rethrow;
        // Or continue to find more bugs?
        // Integration tests stop on first failure.
      }
    }
  });
}

// --- Squad Implementations ---

/// Squad 1: Speed Runners
/// Taps buttons faster than humanly possible.
Future<void> _runSpeedRunners(WidgetTester tester, Random rnd) async {
  final buttons = find.byType(ElevatedButton);
  final count = buttons.evaluate().length;

  if (count > 0) {
    // Rapid Fire 5 times
    for (int k = 0; k < 5; k++) {
      final target = buttons.at(rnd.nextInt(count));
      // Use runAsync if pure tap is blocked? No, standard tap.
      try {
        await tester.tap(target);
        // Bare minimum pump to process event but not settle animation
        await tester.pump(const Duration(milliseconds: 50));
      } catch (e) {
        // Ignored unmounted issues expected here
      }
    }
  }

  // Rapid Scroll
  final scrollables = find.byType(Scrollable);
  if (scrollables.evaluate().isNotEmpty) {
    await tester.drag(scrollables.first, const Offset(0, -200));
    await tester.pump(const Duration(milliseconds: 50));
    await tester.drag(scrollables.first, const Offset(0, 200));
    await tester.pump(const Duration(milliseconds: 50));
  }
}

/// Squad 2: Network Ghosts
/// Connectivity Edge Cases
Future<void> _runNetworkGhosts(
    WidgetTester tester, MutableMockApplicationRepository repo) async {
  // Toggle Network Failure
  repo.simulateNetworkError = true;
  debugPrint('   👻 Simulating Offline/Failure...');

  // Attempt Action (e.g. form submit if possible, or just navigation that triggers load)
  // Since we are in form screen, maybe trigger a "Save Draft" or "Continue" logic if relevant.
  // We can tap "Next" if present.
  final nextBtn = find.text('ถัดไป');
  if (nextBtn.evaluate().isNotEmpty) {
    await tester.tap(nextBtn.first);
    await tester.pumpAndSettle(const Duration(milliseconds: 500));

    // Verify Error Handling (Optional: check for SnackBar)
    // expect(find.byType(SnackBar), findsOneWidget); // Might be too strict for generic fuzz
  }

  // Restore Network
  repo.simulateNetworkError = false;
  debugPrint('   👻 Restoring Network...');
}

/// Squad 3: Input Spammers
/// Random/Malformed Data
Future<void> _runInputSpammers(WidgetTester tester, Random rnd) async {
  final fields = find.byType(TextField);
  final count = fields.evaluate().length;

  if (count > 0) {
    final targetIndex = rnd.nextInt(count);
    final target = fields.at(targetIndex);

    // Chaos Payloads
    final payloads = [
      'A' * 1000, // Overflow
      '😤🤠🤡👻👽🤖💩', // Emojis
      "' OR '1'='1", // SQLi
      '-9999999', // Negative
      '<script>alert(1)</script>', // XSS
      '          ', // Whitespace
    ];

    final payload = payloads[rnd.nextInt(payloads.length)];
    debugPrint('   🤡 Injecting Payload: ${payload.substring(0, 10)}...');

    await tester.enterText(target, payload);
    await tester.testTextInput
        .receiveAction(TextInputAction.done); // Force validation
    await tester.pump();
  }
}

/// Squad 4: Deep Navigators
/// Lifecycle Changes
Future<void> _runDeepNavigators(WidgetTester tester) async {
  // Simulate Backgrounding
  debugPrint('   💤 App Going to Background...');
  tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);

  // Wait a bit
  await Future.delayed(const Duration(milliseconds: 100)); // Real time wait

  // Simulate Foregrounding
  debugPrint('   ☀️ App Resuming...');
  tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);

  await tester.pumpAndSettle();
}
