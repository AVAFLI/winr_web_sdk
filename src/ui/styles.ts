import { Theme } from '../types';
import { generateCSSVariables } from './theme';

/**
 * Generate all CSS styles for WINR modal
 */
export function generateModalStyles(theme: Theme): string {
  const cssVariables = generateCSSVariables(theme);

  return `
/* WINR Modal Styles */
.winr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: var(--winr-spacing-md);
  box-sizing: border-box;
  font-family: var(--winr-font-family);
  
  /* CSS Variables */
  ${cssVariables}
}

.winr-modal {
  background: var(--winr-color-background);
  border-radius: var(--winr-radius-xl);
  box-shadow: var(--winr-shadow-xl);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: winr-modal-enter 0.3s ease-out;
}

@keyframes winr-modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.winr-modal-exit {
  animation: winr-modal-exit 0.2s ease-in forwards;
}

@keyframes winr-modal-exit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
}

/* Header */
.winr-modal-header {
  background: linear-gradient(135deg, var(--winr-color-primary), var(--winr-color-secondary));
  padding: var(--winr-spacing-lg);
  position: relative;
  text-align: center;
}

.winr-close-button {
  position: absolute;
  top: var(--winr-spacing-md);
  right: var(--winr-spacing-md);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--winr-radius-full);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 18px;
  transition: all 0.2s ease;
}

.winr-close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.winr-logo {
  height: 40px;
  margin-bottom: var(--winr-spacing-sm);
}

.winr-header-title {
  color: white;
  font-size: var(--winr-font-size-xl);
  font-weight: var(--winr-font-weight-bold);
  margin: 0 0 var(--winr-spacing-xs) 0;
}

.winr-header-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--winr-font-size-sm);
  margin: 0;
}

/* Content Area */
.winr-modal-content {
  padding: var(--winr-spacing-lg);
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

/* Streak Dashboard */
.winr-streak-dashboard {
  margin-bottom: var(--winr-spacing-lg);
}

.winr-streak-title {
  color: var(--winr-color-text);
  font-size: var(--winr-font-size-lg);
  font-weight: var(--winr-font-weight-semibold);
  text-align: center;
  margin-bottom: var(--winr-spacing-md);
}

.winr-streak-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: var(--winr-spacing-sm);
  margin-bottom: var(--winr-spacing-lg);
}

.winr-streak-day {
  background: var(--winr-color-surface);
  border-radius: var(--winr-radius-lg);
  padding: var(--winr-spacing-md) var(--winr-spacing-sm);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.winr-streak-day.completed {
  background: linear-gradient(135deg, var(--winr-color-primary), var(--winr-color-secondary));
  color: white;
  transform: scale(1.05);
}

.winr-streak-day.current {
  border-color: var(--winr-color-primary);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.winr-streak-day-number {
  font-size: var(--winr-font-size-sm);
  font-weight: var(--winr-font-weight-medium);
  color: var(--winr-color-text-secondary);
  margin-bottom: var(--winr-spacing-xs);
}

.winr-streak-day.completed .winr-streak-day-number {
  color: white;
}

.winr-streak-day-entries {
  font-size: var(--winr-font-size-base);
  font-weight: var(--winr-font-weight-bold);
  color: var(--winr-color-text);
}

.winr-streak-day.completed .winr-streak-day-entries {
  color: white;
}

.winr-streak-day-label {
  font-size: var(--winr-font-size-sm);
  color: var(--winr-color-text-secondary);
  margin-top: var(--winr-spacing-xs);
}

.winr-streak-day.completed .winr-streak-day-label {
  color: rgba(255, 255, 255, 0.9);
}

/* Stats */
.winr-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--winr-spacing-lg);
  background: var(--winr-color-surface);
  border-radius: var(--winr-radius-lg);
  padding: var(--winr-spacing-md);
}

.winr-stat {
  text-align: center;
  flex: 1;
}

.winr-stat-value {
  font-size: var(--winr-font-size-xl);
  font-weight: var(--winr-font-weight-bold);
  color: var(--winr-color-primary);
  display: block;
}

.winr-stat-label {
  font-size: var(--winr-font-size-sm);
  color: var(--winr-color-text-secondary);
  margin-top: var(--winr-spacing-xs);
}

/* Action Buttons */
.winr-actions {
  display: flex;
  flex-direction: column;
  gap: var(--winr-spacing-md);
}

.winr-primary-button {
  background: linear-gradient(135deg, var(--winr-color-primary), var(--winr-color-secondary));
  color: white;
  border: none;
  border-radius: var(--winr-radius-lg);
  padding: var(--winr-spacing-md) var(--winr-spacing-lg);
  font-size: var(--winr-font-size-base);
  font-weight: var(--winr-font-weight-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--winr-spacing-sm);
}

.winr-primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--winr-shadow-lg);
}

.winr-primary-button:active {
  transform: translateY(0);
}

.winr-primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.winr-secondary-button {
  background: var(--winr-color-surface);
  color: var(--winr-color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--winr-radius-lg);
  padding: var(--winr-spacing-sm) var(--winr-spacing-lg);
  font-size: var(--winr-font-size-sm);
  font-weight: var(--winr-font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.winr-secondary-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.winr-secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Spinner */
.winr-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: winr-spin 1s linear infinite;
}

@keyframes winr-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Email Capture */
.winr-email-capture {
  background: var(--winr-color-surface);
  border-radius: var(--winr-radius-lg);
  padding: var(--winr-spacing-lg);
  margin-bottom: var(--winr-spacing-lg);
}

.winr-email-title {
  color: var(--winr-color-text);
  font-size: var(--winr-font-size-lg);
  font-weight: var(--winr-font-weight-semibold);
  text-align: center;
  margin-bottom: var(--winr-spacing-sm);
}

.winr-email-subtitle {
  color: var(--winr-color-text-secondary);
  font-size: var(--winr-font-size-sm);
  text-align: center;
  margin-bottom: var(--winr-spacing-lg);
}

.winr-form-group {
  margin-bottom: var(--winr-spacing-md);
}

.winr-form-label {
  color: var(--winr-color-text);
  font-size: var(--winr-font-size-sm);
  font-weight: var(--winr-font-weight-medium);
  display: block;
  margin-bottom: var(--winr-spacing-sm);
}

.winr-form-input {
  width: 100%;
  background: var(--winr-color-background);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--winr-radius-md);
  padding: var(--winr-spacing-md);
  color: var(--winr-color-text);
  font-size: var(--winr-font-size-base);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.winr-form-input:focus {
  outline: none;
  border-color: var(--winr-color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.winr-form-input::placeholder {
  color: var(--winr-color-text-secondary);
}

.winr-checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: var(--winr-spacing-sm);
}

.winr-checkbox {
  margin-top: 2px;
}

.winr-checkbox-label {
  font-size: var(--winr-font-size-sm);
  color: var(--winr-color-text-secondary);
  line-height: 1.5;
  cursor: pointer;
}

/* Error States */
.winr-form-input.error {
  border-color: var(--winr-color-error);
}

.winr-error-message {
  color: var(--winr-color-error);
  font-size: var(--winr-font-size-sm);
  margin-top: var(--winr-spacing-xs);
}

/* Success Animation */
.winr-success-animation {
  text-align: center;
  padding: var(--winr-spacing-lg);
}

.winr-success-icon {
  font-size: 48px;
  color: var(--winr-color-success);
  animation: winr-bounce 0.6s ease;
}

@keyframes winr-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .winr-modal-overlay {
    padding: var(--winr-spacing-sm);
  }
  
  .winr-modal {
    max-height: 95vh;
  }
  
  .winr-modal-header {
    padding: var(--winr-spacing-md);
  }
  
  .winr-modal-content {
    padding: var(--winr-spacing-md);
  }
  
  .winr-streak-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--winr-spacing-xs);
  }
  
  .winr-streak-day {
    padding: var(--winr-spacing-sm);
  }
  
  .winr-stats {
    flex-direction: column;
    text-align: center;
    gap: var(--winr-spacing-sm);
  }
}

/* Dark mode preference support */
@media (prefers-color-scheme: light) {
  .winr-modal-overlay {
    --winr-color-background: #ffffff;
    --winr-color-surface: #f8fafc;
    --winr-color-text: #1e293b;
    --winr-color-text-secondary: #64748b;
  }
}

/* High contrast support */
@media (prefers-contrast: high) {
  .winr-modal {
    border: 2px solid var(--winr-color-text);
  }
  
  .winr-form-input {
    border: 2px solid var(--winr-color-text);
  }
  
  .winr-primary-button {
    border: 2px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .winr-modal,
  .winr-primary-button,
  .winr-streak-day,
  .winr-spinner,
  .winr-success-icon {
    animation: none;
  }
  
  .winr-modal {
    transform: none;
  }
  
  .winr-primary-button:hover:not(:disabled) {
    transform: none;
  }
}
`;
}

/**
 * Inject styles into document head
 */
export function injectStyles(theme: Theme): () => void {
  const styleId = 'winr-modal-styles';
  
  // Remove existing styles
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new styles
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = generateModalStyles(theme);
  document.head.appendChild(style);

  // Return cleanup function
  return () => {
    const element = document.getElementById(styleId);
    if (element) {
      element.remove();
    }
  };
}