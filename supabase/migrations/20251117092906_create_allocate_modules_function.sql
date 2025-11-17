/*
  # Création de la fonction allocate_modules_for_user

  1. Fonction PostgreSQL
    - allocate_modules_for_user(p_user_id, p_project_id, p_invested_amount)
    - Allocation automatique des modules en fonction du montant investi
    - Création de nouveaux modules si nécessaire
    - Mise à jour atomique des parts disponibles

  2. Sécurité
    - Fonction SECURITY DEFINER pour exécution avec privilèges
    - Transaction atomique pour éviter les incohérences
    - Vérification des données d'entrée
*/

CREATE OR REPLACE FUNCTION allocate_modules_for_user(
  p_user_id uuid,
  p_project_id uuid,
  p_invested_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project record;
  v_module record;
  v_price_per_part numeric;
  v_remaining numeric;
  v_possible_parts int;
  v_allocations jsonb := '[]'::jsonb;
  v_new_module_id uuid;
BEGIN
  -- 1. Récupérer les infos du projet
  SELECT * INTO v_project
  FROM invest_projects
  WHERE id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Projet introuvable: %', p_project_id;
  END IF;

  -- 2. Calculer le prix par part
  v_price_per_part := v_project.prix_par_module / v_project.parts_par_module;
  v_remaining := p_invested_amount;

  -- 3. Allocation sur les modules existants
  FOR v_module IN
    SELECT * FROM invest_modules
    WHERE project_id = p_project_id
    AND available_parts > 0
    ORDER BY created_at ASC
  LOOP
    v_possible_parts := LEAST(
      FLOOR(v_remaining / v_price_per_part)::int,
      v_module.available_parts
    );

    IF v_possible_parts > 0 THEN
      -- Insérer les parts
      INSERT INTO invest_module_parts (
        module_id,
        user_id,
        part,
        amount_paid,
        status,
        reservation_expires_at
      ) VALUES (
        v_module.id,
        p_user_id,
        v_possible_parts,
        v_possible_parts * v_price_per_part,
        'payé',
        NULL
      );

      -- Mettre à jour les parts disponibles
      UPDATE invest_modules
      SET available_parts = available_parts - v_possible_parts
      WHERE id = v_module.id;

      v_remaining := v_remaining - (v_possible_parts * v_price_per_part);

      -- Ajouter à la liste des allocations
      v_allocations := v_allocations || jsonb_build_object(
        'module_id', v_module.id,
        'parts', v_possible_parts,
        'amount', v_possible_parts * v_price_per_part
      );
    END IF;

    EXIT WHEN v_remaining < v_price_per_part;
  END LOOP;

  -- 4. Créer un nouveau module si nécessaire
  IF v_remaining >= v_price_per_part THEN
    v_possible_parts := FLOOR(v_remaining / v_price_per_part)::int;

    INSERT INTO invest_modules (
      name,
      max_parts,
      price,
      available_parts,
      status,
      project_id
    ) VALUES (
      'Module ' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS'),
      v_possible_parts,
      v_price_per_part,
      0,
      'en cours',
      p_project_id
    )
    RETURNING id INTO v_new_module_id;

    -- Insérer les parts pour le nouveau module
    INSERT INTO invest_module_parts (
      module_id,
      user_id,
      part,
      amount_paid,
      status,
      reservation_expires_at
    ) VALUES (
      v_new_module_id,
      p_user_id,
      v_possible_parts,
      v_possible_parts * v_price_per_part,
      'payé',
      NULL
    );

    v_remaining := v_remaining - (v_possible_parts * v_price_per_part);

    v_allocations := v_allocations || jsonb_build_object(
      'module_id', v_new_module_id,
      'parts', v_possible_parts,
      'amount', v_possible_parts * v_price_per_part,
      'new_module', true
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'allocations', v_allocations,
    'remaining', v_remaining
  );
END;
$$;