import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:wait_zero_app/main.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('app boots and shows splash screen content', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const WaitZeroApp());

    // Splash renders immediately — verify branding is shown
    expect(find.text('Wait Zero'), findsOneWidget);
    expect(find.text('Smart Clinic Booking'), findsOneWidget);

    // Drain all pending timers (splash Future.delayed + animation controller)
    // so the test runner does not fail on leaked timers
    await tester.pump(const Duration(seconds: 4));
    await tester.pump(const Duration(milliseconds: 500));
  });
}
