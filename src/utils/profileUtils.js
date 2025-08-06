import { supabase } from '../lib/supabaseClient';





/**
 * Ensures a user profile exists in the profiles table
 * @param {Object} user - The authenticated user object from Supabase
 * @returns {Object} - Returns { success: boolean, profile: object, error: string }
 */
export const ensureUserProfile = async (user) => {
  if (!user) {
    return { success: false, error: 'No user provided' };
  }

  try {
    // First check if profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If profile exists, return it
    if (existingProfile && !selectError) {
      console.log('Profile already exists:', existingProfile);
      return { success: true, profile: existingProfile };
    }

    // If error is not "no rows returned", it's a real error
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', selectError);
      return { success: false, error: `Error checking profile: ${selectError.message}` };
    }

    // Profile doesn't exist, create a new one
    console.log('Profile does not exist, creating one...');
    
    const userMetadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};
    
    // Extract name from email if not provided in metadata
    const emailUsername = user.email?.split('@')[0] || 'User';
    
    const profileData = {
      user_id: user.id,
      email: user.email,
      first_name: userMetadata.first_name || 
                 userMetadata.full_name?.split(' ')[0] || 
                 appMetadata.first_name ||
                 emailUsername,
      last_name: userMetadata.last_name || 
                userMetadata.full_name?.split(' ').slice(1).join(' ') || 
                appMetadata.last_name ||
                '',
      company: userMetadata.company || appMetadata.company || '',
      position: userMetadata.position || appMetadata.position || '',
      avatar_url: userMetadata.avatar_url || appMetadata.avatar_url || null,
      // created_at: new Date().toISOString(),
      // updated_at: new Date().toISOString(),
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return { success: false, error: `Profile creation failed: ${insertError.message}` };
    }

    console.log('Profile created successfully:', newProfile);
    return { success: true, profile: newProfile };

  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
};







/**
 * Updates an existing user profile
 * @param {string} userId - The user ID
 * @param {Object} updates - Object containing profile fields to update
 * @returns {Object} - Returns { success: boolean, profile: object, error: string }
 */
export const updateUserProfile = async (userId, updates) => {
  if (!userId) {
    return { success: false, error: 'No user ID provided' };
  }

  try {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: `Profile update failed: ${error.message}` };
    }

    console.log('Profile updated successfully:', updatedProfile);
    return { success: true, profile: updatedProfile };

  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
};






/**
 * Gets a user profile by ID
 * @param {string} userId - The user ID
 * @returns {Object} - Returns { success: boolean, profile: object, error: string }
 */
export const getUserProfile = async (userId) => {
  if (!userId) {
    return { success: false, error: 'No user ID provided' };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: `Error fetching profile: ${error.message}` };
    }

    return { success: true, profile };

  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
};
