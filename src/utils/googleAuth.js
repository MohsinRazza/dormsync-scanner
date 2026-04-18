// Google OAuth authentication utility

/**
 * Initialize Google OAuth
 */
export const initializeGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    // Load Google Identity Services script
    if (window.google) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        resolve(window.google);
      } else {
        reject(new Error('Google Identity Services failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
};

/**
 * Get authorized users from localStorage
 */
export const getAuthorizedUsers = () => {
  const users = localStorage.getItem('dormsyncscanner_authorized_users');
  if (!users) {
    // Default authorized users
    const defaultUsers = [
      '23021519-058@uog.edu.pk',
      'mustafa@uog.edu.pk',
      'najeeb.rehman@uog.edu.pk',
      'moeen.khalid@uog.edu.pk',
      '23011556-110@uog.edu.pk'
    ];
    localStorage.setItem('dormsyncscanner_authorized_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(users);
};

/**
 * Add authorized user
 */
export const addAuthorizedUser = (email) => {
  const users = getAuthorizedUsers();
  if (!users.includes(email)) {
    users.push(email);
    localStorage.setItem('dormsyncscanner_authorized_users', JSON.stringify(users));
  }
  return users;
};

/**
 * Remove authorized user
 */
export const removeAuthorizedUser = (email) => {
  const users = getAuthorizedUsers();
  const filteredUsers = users.filter(user => user !== email);
  localStorage.setItem('dormsyncscanner_authorized_users', JSON.stringify(filteredUsers));
  return filteredUsers;
};

/**
 * Check if email is from organization domain
 */
export const isOrganizationEmail = (email) => {
  const orgDomain = import.meta.env.VITE_ORGANIZATION_DOMAIN || 'uog.edu.pk';
  return email.endsWith(`@${orgDomain}`);
};

/**
 * Check if user is authorized
 */
export const isUserAuthorized = (email) => {
  if (!isOrganizationEmail(email)) {
    return false;
  }

  const authorizedUsers = getAuthorizedUsers();
  return authorizedUsers.includes(email);
};

/**
 * Handle Google OAuth response
 */
export const handleGoogleResponse = (response) => {
  return new Promise((resolve, reject) => {
    try {
      // Decode JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));

      const userInfo = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };

      // Check if email is verified
      if (!userInfo.emailVerified) {
        reject(new Error('Email not verified'));
        return;
      }

      // Check organization domain
      if (!isOrganizationEmail(userInfo.email)) {
        reject(new Error(`Only @${import.meta.env.VITE_ORGANIZATION_DOMAIN || 'uog.edu.pk'} emails are allowed`));
        return;
      }

      // Check if user is authorized
      if (!isUserAuthorized(userInfo.email)) {
        reject(new Error('You are not authorized to access this system. Please contact the administrator.'));
        return;
      }

      resolve(userInfo);
    } catch (error) {
      reject(new Error('Failed to process Google authentication'));
    }
  });
};

/**
 * Initialize Google Sign-In button
 */
export const initializeGoogleSignIn = (onSuccess, onError) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    onError(new Error('Google Client ID not configured'));
    return;
  }

  initializeGoogleAuth()
    .then((google) => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          handleGoogleResponse(response)
            .then(onSuccess)
            .catch(onError);
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular'
        }
      );
    })
    .catch(onError);
};
