import { supabase } from '../lib/supabaseClient';




/**
 * Creates a new shift in the shifts table
 * @param {Object} shiftData - The shift data object
 * @param {string} userId - The user ID
 * @returns {Object} - Returns { success: boolean, shift: object, error: string }
 */
export const createShift = async (shiftData, userId) => {
    if (!userId) {
        return { success: false, error: 'No user ID provided' };
    }



    if (!shiftData) {
        return { success: false, error: 'No shift data provided' };
    }



    try {
        // Validate required fields
        const requiredFields = ['date', 'startTime', 'endTime', 'wageId'];
        for (const field of requiredFields) {
            if (!shiftData[field]) {
                return { success: false, error: `Missing required field: ${field}` };
            }
        }

        // Get wage information to extract position_title
        const { data: wageData, error: wageError } = await supabase
            .from('wages')
            .select('position_title')
            .eq('id', shiftData.wageId)
            .eq('user_id', userId)
            .single();

        if (wageError) {
            console.error('Error fetching wage data:', wageError);
            return { success: false, error: `Error fetching wage data: ${wageError.message}` };
        }

        if (!wageData) {
            return { success: false, error: 'Selected wage not found or does not belong to user' };
        }

        // Convert time strings to datetime format for database
        const dateStr = shiftData.date;
        const clockIn = `${dateStr} ${shiftData.startTime}:00`;
        const clockOut = `${dateStr} ${shiftData.endTime}:00`;
        
        // Handle lunch times - only include if lunch is added
        let lunchIn = null;
        let lunchOut = null;
        
        if (shiftData.addLunch && shiftData.lunchInTime && shiftData.lunchOutTime) {
            lunchIn = `${dateStr} ${shiftData.lunchInTime}:00`;
            lunchOut = `${dateStr} ${shiftData.lunchOutTime}:00`;
        }

        // Prepare shift data for insertion
        const insertData = {
            user_id: userId,
            clock_in: clockIn,
            clock_out: clockOut,
            lunch_in: lunchIn || null,
            lunch_out: lunchOut || null,
            notes: shiftData.notes || null,
            position_title: wageData.position_title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Inserting shift data:', insertData);

        // Insert the shift
        const { data: newShift, error: insertError } = await supabase
            .from('shifts')
            .insert([insertData])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating shift:', insertError);
            return { success: false, error: `Failed to create shift: ${insertError.message}` };
        }

        console.log('Shift created successfully:', newShift);
        return { success: true, shift: newShift };



    } catch (error) {
        console.error('Unexpected error in createShift:', error);
        return { success: false, error: `Unexpected error: ${error.message}` };
    }
};







/**
 * Validates shift times to ensure they make logical sense
 * @param {Object} shiftData - The shift data object
 * @returns {Object} - Returns { valid: boolean, error: string }
 */
export const validateShiftTimes = (shiftData) => {
    const { startTime, endTime, lunchInTime, lunchOutTime, addLunch } = shiftData;

    // Convert time strings to minutes for comparison
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Check if start time is before end time
    if (startMinutes >= endMinutes) {
        return { valid: false, error: 'Clock out time must be after clock in time' };
    }

    // If lunch is added, validate lunch times
    if (addLunch && lunchInTime && lunchOutTime) {
        const lunchInMinutes = timeToMinutes(lunchInTime);
        const lunchOutMinutes = timeToMinutes(lunchOutTime);

        // Check if lunch in is after start time
        if (lunchInMinutes <= startMinutes) {
            return { valid: false, error: 'Lunch in time must be after clock in time' };
        }

        // Check if lunch out is before end time
        if (lunchOutMinutes >= endMinutes) {
            return { valid: false, error: 'Lunch out time must be before clock out time' };
        }

        // Check if lunch in is before lunch out
        if (lunchInMinutes >= lunchOutMinutes) {
            return { valid: false, error: 'Lunch out time must be after lunch in time' };
        }
    }

    return { valid: true };
};








/**
 * Calculates total hours worked for a shift
 * @param {Object} shiftData - The shift data object
 * @returns {number} - Total hours worked (decimal)
 */
export const calculateShiftHours = (shiftData) => {
    const { startTime, endTime, lunchInTime, lunchOutTime, addLunch } = shiftData;

    // Convert time strings to minutes
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    let totalMinutes = endMinutes - startMinutes;

    // Subtract lunch time if applicable
    if (addLunch && lunchInTime && lunchOutTime) {
        const lunchInMinutes = timeToMinutes(lunchInTime);
        const lunchOutMinutes = timeToMinutes(lunchOutTime);
        const lunchDuration = lunchOutMinutes - lunchInMinutes;
        totalMinutes -= lunchDuration;
    }

    // Convert to hours (decimal)
    return totalMinutes / 60;
};
