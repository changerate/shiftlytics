import { type } from 'os';
import { supabase } from '../lib/supabaseClient';



/**
 * Fetches all wages for a specific user from the wages table
 * @param {string} userId - The user ID
 * @returns {Object} - Returns { success: boolean, wages: array, error: string }
 */
export const getUserWages = async (userId) => {
    if (!userId) {
        return { success: false, error: 'No user ID provided' };
    }

    try {
        
        const { data: wages, error } = await supabase
            .from('wages')
            .select('*')
            .eq('user_id', userId)
            .order('position_title', { ascending: true });
        
        if (error) {
            console.error('Error fetching wages:', error);
            return { success: false, error: `Error fetching wages: ${error.message}` };
        }
        
        return { success: true, wages: wages || [] };

    } catch (error) {
        console.error('Unexpected error in getUserWages:', error);
        return { success: false, error: `Unexpected error: ${error.message}` };
    }
};





/**
 * Creates a wage for a specific user
 * @param {string} userId - The user ID
 * @param {{ position_title: string, amount: number, occurrence: 'hourly'|'salary' }} wage
 * @returns {Object} - Returns { success: boolean, wage: object, error: string }
 */
export const createUserWage = async (userId, wage) => {
    if (!userId) {
        return { success: false, error: 'No user ID provided' };
    }

    const { position_title, amount, occurrence } = wage || {};
    if (!position_title || !amount || !occurrence) {
        return { success: false, error: 'Missing required fields' };
    }

    try {
        // Ensure we provide an id if the DB doesn't default it
        let id = wage?.id;
        if (!id) {
            if (typeof crypto !== 'undefined' && crypto?.randomUUID) {
                id = crypto.randomUUID();
            } else {
                return { success: false, error: 'UUID generation not available; please add a default gen_random_uuid() on wages.id' };
            }
        }

        const payload = {
            id,
            user_id: userId,
            position_title,
            amount,
            occurrence,
        };

        const { data: created, error } = await supabase
            .from('wages')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error creating wage:', error);
            return { success: false, error: `Error creating wage: ${error.message}` };
        }

        return { success: true, wage: created };
    } catch (error) {
        console.error('Unexpected error in createUserWage:', error);
        return { success: false, error: `Unexpected error: ${error.message}` };
    }
};

/**
 * Formats wage amount for display
 * @param {number} amount - The wage amount
 * @param {string} occurrence - The wage occurrence ('hourly' or 'salary')
 * @returns {string} - Formatted wage string
 */
export const formatWageDisplay = (amount, occurrence) => {
    if (!amount || !occurrence) return '';
  
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: occurrence === 'hourly' ? 2 : 0,
        maximumFractionDigits: occurrence === 'hourly' ? 2 : 0,
    }).format(amount);

    return occurrence === 'hourly' ? `${formattedAmount}/hr` : `${formattedAmount}/yr`;
};




/**
 * Creates a wage display string for dropdown options
 * @param {Object} wage - The wage object from database
 * @returns {string} - Formatted display string like "[Copy Center  $18/hr]"
 */
export const createWageDisplayString = (wage) => {
    if (!wage || !wage.position_title || !wage.amount || !wage.occurrence) {
        return 'Invalid wage data';
    }
    
    const formattedAmount = formatWageDisplay(wage.amount, wage.occurrence);
    return `${wage.position_title}  ${formattedAmount}`;
};
