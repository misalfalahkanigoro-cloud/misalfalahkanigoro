import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const { error } = await supabaseAdmin()
            .from('achievements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin achievement DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
    }
}
