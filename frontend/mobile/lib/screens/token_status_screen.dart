import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';
import '../widgets/token_display.dart';

/// Token Status Screen
/// Shows live token status and queue position for the patient
class TokenStatusScreen extends StatefulWidget {
  const TokenStatusScreen({super.key});

  @override
  State<TokenStatusScreen> createState() => _TokenStatusScreenState();
}

class _TokenStatusScreenState extends State<TokenStatusScreen> {
  List<dynamic> _tokens = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTokens();
  }

  Future<void> _loadTokens() async {
    setState(() {
      _loading = true;
    });

    try {
      final result = await ApiService().get('/tokens/my');
      if (result['success'] == true) {
        setState(() {
          _tokens = result['tokens'] ?? [];
        });
      }
    } catch (e) {
      // Handle offline
    } finally {
      if (mounted)
        setState(() {
          _loading = false;
        });
    }
  }

  Future<void> _checkIn(int tokenId) async {
    try {
      final result = await ApiService().post('/tokens/$tokenId/checkin', {
        'latitude': 28.6139,
        'longitude': 77.2090,
      });

      if (!mounted) return; // widget may have been disposed during the await
      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('✅ Check-in successful!'),
              backgroundColor: AppTheme.success),
        );
        _loadTokens();
      }
    } catch (e) {
      if (!mounted) return; // guard before using context
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Check-in failed: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tokens'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadTokens),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadTokens,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _tokens.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.confirmation_number_outlined,
                            size: 64, color: AppTheme.textMuted),
                        const SizedBox(height: 16),
                        const Text('No tokens for today',
                            style: TextStyle(
                                color: AppTheme.textMuted, fontSize: 16)),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () =>
                              Navigator.pushNamed(context, '/booking'),
                          child: const Text('Book Appointment'),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _tokens.length,
                    itemBuilder: (context, index) {
                      final token = _tokens[index];
                      return TokenDisplay(
                        tokenNumber: token['token_number'] ?? 0,
                        doctorName: token['doctor_name'] ?? 'Doctor',
                        specialization: token['specialization'] ?? '',
                        status: token['status'] ?? 'waiting',
                        queuePosition: token['queue_position'] ?? 0,
                        estimatedWait: token['estimated_wait_minutes'] ?? 0,
                        onCheckIn: token['check_in_time'] == null
                            ? () => _checkIn(token['id'])
                            : null,
                      );
                    },
                  ),
      ),
    );
  }
}
