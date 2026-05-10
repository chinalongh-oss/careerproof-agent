-- RPC for atomic project_cards replacement + status update
-- Migration: 003_replace_project_cards_rpc

CREATE OR REPLACE FUNCTION replace_project_cards(
    p_case_id uuid,
    p_cards jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    card jsonb;
    inserted_count integer := 0;
BEGIN
    -- All operations in a single transaction
    -- Any failure will rollback everything

    -- 1. Delete all existing project_cards for this case_id
    DELETE FROM public.project_cards
    WHERE case_id = p_case_id;

    -- 2. Insert new project_cards
    FOR card IN SELECT * FROM jsonb_array_elements(p_cards)
    LOOP
        INSERT INTO public.project_cards (
            case_id,
            project_name,
            business_context,
            business_problem,
            candidate_role,
            personal_actions,
            team_actions,
            metrics,
            result_summary,
            evidence_level,
            public_visibility,
            risk_flags,
            role_angle_tags,
            reader_lens_tags,
            recommended_expression,
            not_recommended_expression,
            interview_risks,
            is_featured
        ) VALUES (
            p_case_id,
            card->>'project_name',
            card->>'business_context',
            card->>'business_problem',
            card->>'candidate_role',
            (card->'personal_actions')::jsonb,
            (card->'team_actions')::jsonb,
            (card->'metrics')::jsonb,
            card->>'result_summary',
            card->>'evidence_level',
            card->>'public_visibility',
            (card->'risk_flags')::jsonb,
            (card->'role_angle_tags')::jsonb,
            (card->'reader_lens_tags')::jsonb,
            card->>'recommended_expression',
            card->>'not_recommended_expression',
            (card->'interview_risks')::jsonb,
            COALESCE((card->>'is_featured')::boolean, false)
        );
        inserted_count := inserted_count + 1;
    END LOOP;

    -- 3. Update case status to evidence_ready
    UPDATE public.cases
    SET status = 'evidence_ready', updated_at = now()
    WHERE id = p_case_id;

    RETURN jsonb_build_object(
        'ok', true,
        'inserted', inserted_count
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'replace_project_cards failed: %', SQLERRM;
END;
$$;
