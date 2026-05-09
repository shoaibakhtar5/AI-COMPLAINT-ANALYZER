import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useState } from 'react';
import AuthInput from './AuthInput';

export default function SecretKeyField({ label = 'Company Secret Key', helper = 'This secret key is required for secure company workspace login.', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      label={label}
      icon={KeyRound}
      type={visible ? 'text' : 'password'}
      hint={props.error ? undefined : helper}
      autoComplete="one-time-code"
      right={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          aria-label={visible ? 'Hide company secret key' : 'Show company secret key'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
}
