import './GuestWarning.css';

interface GuestWarningProps {
  onLogin: () => void;
  onDismiss: () => void;
}

const GuestWarning: React.FC<GuestWarningProps> = ({ onLogin, onDismiss }) => {
  return (
    <div className="guest-warning-overlay" onClick={onDismiss}>
      <div className="guest-warning-modal" onClick={(e) => e.stopPropagation()}>
        <div className="guest-warning-icon">⚠️</div>
        <h2 className="guest-warning-title">Your Progress Will Be Lost!</h2>
        <p className="guest-warning-text">
          Your coins, unlocked skins, and level progress won&apos;t be saved.
          Log in to keep everything safe across sessions.
        </p>
        <button className="guest-warning-login-btn" onClick={onLogin}>
          🔐 Log In to Save Progress
        </button>
        <button className="guest-warning-dismiss-btn" onClick={onDismiss}>
          Continue Without Saving
        </button>
        <p className="guest-warning-note">
          You&apos;ll keep playing right where you left off after logging in
        </p>
      </div>
    </div>
  );
};

export default GuestWarning;
