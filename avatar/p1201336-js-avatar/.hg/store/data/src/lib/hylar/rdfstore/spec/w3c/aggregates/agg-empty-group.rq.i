         m   l       ��������Cf#��(�v5����S6eϡ(n            uPREFIX ex: <http://example.com/>
SELECT ?x (MAX(?value) AS ?max)
WHERE {
	?x ex:p ?value
} GROUP BY ?x
