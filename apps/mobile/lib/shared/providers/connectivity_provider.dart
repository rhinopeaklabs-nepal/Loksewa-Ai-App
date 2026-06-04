import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum ConnectivityState {
  initial,
  connected,
  disconnected,
  restored,
}

class ConnectivityNotifier extends StateNotifier<ConnectivityState> {
  final Connectivity _connectivity = Connectivity();
  StreamSubscription? _subscription;
  bool _wasDisconnected = false;

  ConnectivityNotifier() : super(ConnectivityState.initial) {
    _init();
  }

  Future<void> _init() async {
    try {
      final results = await _connectivity.checkConnectivity();
      _handleResults(results);
    } catch (_) {}
    _subscription = _connectivity.onConnectivityChanged.listen(_handleResults);
  }

  void _handleResults(List<ConnectivityResult> results) {
    final isNone = results.isEmpty || (results.length == 1 && results.first == ConnectivityResult.none);
    if (isNone) {
      _wasDisconnected = true;
      state = ConnectivityState.disconnected;
    } else {
      if (_wasDisconnected) {
        state = ConnectivityState.restored;
        _wasDisconnected = false;
        // After 3 seconds, clear the restored state and set to connected
        Future.delayed(const Duration(seconds: 3), () {
          if (state == ConnectivityState.restored) {
            state = ConnectivityState.connected;
          }
        });
      } else {
        state = ConnectivityState.connected;
      }
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

final connectivityStatusProvider = StateNotifierProvider<ConnectivityNotifier, ConnectivityState>((ref) {
  return ConnectivityNotifier();
});
