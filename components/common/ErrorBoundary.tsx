import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            backgroundColor: '#f9fafb',
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            The app encountered an unexpected error. Please try again.
          </Text>
          <Pressable
            onPress={this.handleRestart}
            style={{
              backgroundColor: '#22c55e',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 16,
            }}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
